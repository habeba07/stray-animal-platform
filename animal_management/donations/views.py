from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from django.conf import settings
from datetime import timedelta, datetime
from django.contrib.auth import get_user_model
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from .models import (
    Donation, DonationCampaign, ImpactCategory, DonationImpact,
    SuccessStory, ImpactMetrics, DonorImpactSummary, RecurringDonation
)
from .serializers import DonationCampaignSerializer, DonationSerializer, RecurringDonationSerializer
import uuid
from decimal import Decimal
from community.services import award_points
from notifications.services import create_notification
import calendar

from .email_utils import send_donation_receipt, send_donation_notification_to_staff, send_campaign_milestone_notification


def update_donor_summary(donor):
    """Update or create donor impact summary"""
    from django.db.models import Sum, Count
    
    # Calculate totals from actual donations
    user_donations = Donation.objects.filter(donor=donor)
    totals = user_donations.aggregate(
        total=Sum('amount'),
        count=Count('id')
    )
    
    # Update or create summary
    summary, created = DonorImpactSummary.objects.get_or_create(
        donor=donor,
        defaults={
            'total_donated': totals['total'] or 0,
            'donations_count': totals['count'] or 0
        }
    )
    
    if not created:
        # Update existing summary
        summary.total_donated = totals['total'] or 0
        summary.donations_count = totals['count'] or 0
        
        # Update first and last donation dates
        first_donation = user_donations.order_by('created_at').first()
        last_donation = user_donations.order_by('-created_at').first()
        
        if first_donation and not summary.first_donation_date:
            summary.first_donation_date = first_donation.created_at
        if last_donation:
            summary.last_donation_date = last_donation.created_at
            
        summary.save()
    
    # Update donor level
    summary.update_donor_level()
    return summary


def create_donation_impact(donation):
    """
    Automatically create impact records when a donation is made.
    Allocates donation amount across different impact categories.
    """
    from .models import ImpactCategory, DonationImpact
    
    # Get or create impact categories with ULTRA-GRANULAR cost values
    categories_config = [
        {
            'name': 'Emergency Medical Treatment',
            'type': 'MEDICAL',
            'description': 'Emergency medical care for rescued animals',
            'cost_per_unit': 3.00,  # $3 per treatment - ensures 1 unit for $3+ allocation
            'unit_name': 'treatment',
            'allocation_percentage': 30,  # 30% of donations
            'color': '#f44336',
            'icon': 'medical_services'
        },
        {
            'name': 'Daily Food & Nutrition',
            'type': 'FOOD', 
            'description': 'Nutritious meals for animals in care',
            'cost_per_unit': 2.00,  # $2 per day of meals - ensures 1 unit for $2+ allocation
            'unit_name': 'day of meals',
            'allocation_percentage': 25,  # 25% of donations
            'color': '#4caf50',
            'icon': 'restaurant'
        },
        {
            'name': 'Safe Shelter & Housing',
            'type': 'SHELTER',
            'description': 'Maintaining safe shelter facilities',
            'cost_per_unit': 2.00,  # $2 per day of shelter - ensures 1 unit for $2+ allocation
            'unit_name': 'day of shelter',
            'allocation_percentage': 20,  # 20% of donations
            'color': '#2196f3',
            'icon': 'home'
        },
        {
            'name': 'Adoption Services',
            'type': 'ADOPTION',
            'description': 'Supporting adoption programs and processes',
            'cost_per_unit': 1.50,  # $1.50 per adoption step - ensures 1 unit for $1.50+ allocation
            'unit_name': 'adoption step',
            'allocation_percentage': 15,  # 15% of donations
            'color': '#e91e63',
            'icon': 'favorite'
        },
        {
            'name': 'Community Education',
            'type': 'EDUCATION',
            'description': 'Educational programs and outreach',
            'cost_per_unit': 1.00,  # $1 per educational resource - ensures 1 unit for $1+ allocation
            'unit_name': 'educational resource',
            'allocation_percentage': 10,  # 10% of donations
            'color': '#ff9800',
            'icon': 'school'
        }
    ]
    
    total_amount = float(donation.amount)
    
    # Create impact categories if they don't exist and allocate donation
    for config in categories_config:
        # Get or create category
        category, created = ImpactCategory.objects.get_or_create(
            name=config['name'],
            defaults={
                'category_type': config['type'],
                'description': config['description'],
                'cost_per_unit': config['cost_per_unit'],
                'unit_name': config['unit_name'],
                'color': config['color'],
                'icon': config['icon']
            }
        )
        
        # Update existing categories with new cost values
        if not created and category.cost_per_unit != config['cost_per_unit']:
            category.cost_per_unit = config['cost_per_unit']
            category.unit_name = config['unit_name']
            category.save()
        
        # Calculate allocation for this category
        allocated_amount = total_amount * (config['allocation_percentage'] / 100)
        units_helped = int(allocated_amount / float(category.cost_per_unit))
        
        # Create impact record if there's meaningful allocation (very low threshold)
        if allocated_amount >= 0.25 and units_helped > 0:  # Very low threshold of $0.25
            DonationImpact.objects.create(
                donation=donation,
                impact_category=category,
                amount_allocated=allocated_amount,
                units_helped=units_helped,
                description=f"Support for {category.name.lower()} through donation"
            )
    
    return True

class DonationCampaignViewSet(viewsets.ModelViewSet):
    queryset = DonationCampaign.objects.all()
    serializer_class = DonationCampaignSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = DonationCampaign.objects.all()
        if self.request.user.user_type == 'PUBLIC':
            # Public users only see active campaigns
            queryset = queryset.filter(is_active=True)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active campaigns"""
        active_campaigns = self.queryset.filter(
            is_active=True,
            end_date__gte=timezone.now().date()
        )
        serializer = self.get_serializer(active_campaigns, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def donate(self, request, pk=None):
        """Make a donation to a campaign"""
        campaign = self.get_object()
    
        # Extract donation data
        amount = request.data.get('amount')
        payment_method = request.data.get('payment_method', 'CREDIT_CARD')
        is_anonymous = request.data.get('is_anonymous', False)
        message = request.data.get('message', '')
    
        if not amount:
            return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
    
        try:
            amount = Decimal(str(amount))
            if amount <= 0:
                return Response({'error': 'Amount must be positive'}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
    
        # Create donation
        donation = Donation.objects.create(
            donor=request.user,
            campaign=campaign,
            amount=amount,
            payment_method=payment_method,
            transaction_id=str(uuid.uuid4()),
            is_anonymous=is_anonymous,
            message=message
        )

        # Award points for donation
        award_points(request.user, 'DONATION_MADE', donation)
    
        # Update campaign amount
        campaign.current_amount = Decimal(str(campaign.current_amount)) + amount
        campaign.save()
        
        # Update donor impact summary
        update_donor_summary(request.user)

        # Create automatic impact tracking
        create_donation_impact(donation)

        send_donation_receipt(donation)
        send_donation_notification_to_staff(donation)
        send_campaign_milestone_notification(campaign)

        # Create donation confirmation notification
        create_notification(
            recipient=request.user,
            notification_type='DONATION_RECEIVED',
            title='Donation Received',
            message=f'Thank you for your donation of ${amount} to {campaign.title}!',
            related_object=donation
        )
        
        # Notify staff if it's a significant donation (over $100)
        if amount >= 100:
            staff_users = get_user_model().objects.filter(user_type__in=['STAFF', 'SHELTER'])
            for staff_user in staff_users:
                create_notification(
                    recipient=staff_user,
                    notification_type='DONATION_RECEIVED',
                    title='Significant Donation Received',
                    message=f'A donation of ${amount} was made to {campaign.title} by {is_anonymous and "Anonymous" or request.user.username}',
                    related_object=donation
                )
    
        serializer = DonationSerializer(donation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Donation.objects.all()
        if self.request.user.user_type == 'PUBLIC':
            # Public users only see their own donations
            queryset = queryset.filter(donor=self.request.user)
        return queryset
    
    @action(detail=False, methods=['get'])
    def my_donations(self, request):
        """Get user's donation history"""
        donations = self.queryset.filter(donor=request.user)
        serializer = self.get_serializer(donations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], authentication_classes=[SessionAuthentication, TokenAuthentication], permission_classes=[IsAuthenticated])
    def receipt(self, request, pk=None):
        """Get HTML receipt for a donation"""
        donation = self.get_object()
    
        # Render the same email template as HTML response
        from django.template.loader import render_to_string
        from django.http import HttpResponse
        from datetime import datetime
    
        context = {
            'donation': donation,
            'current_year': datetime.now().year,
            'organization_name': 'PAW Rescue',
            'organization_email': getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@pawrescue.com'),
        }
    
        # Render HTML receipt
        html_content = render_to_string('donations/receipt_email.html', context)
    
        response = HttpResponse(html_content)
        response['Content-Type'] = 'text/html; charset=utf-8'
        response['Cache-Control'] = 'no-cache'
        return response


class RecurringDonationViewSet(viewsets.ModelViewSet):
    queryset = RecurringDonation.objects.all()
    serializer_class = RecurringDonationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = RecurringDonation.objects.all()
        if self.request.user.user_type == 'PUBLIC':
            # Public users only see their own recurring donations
            queryset = queryset.filter(donor=self.request.user)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(donor=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_subscriptions(self, request):
        """Get user's recurring donation subscriptions"""
        subscriptions = self.queryset.filter(donor=request.user)
        serializer = self.get_serializer(subscriptions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a recurring donation"""
        recurring_donation = self.get_object()
        
        # Only allow the donor or staff to cancel
        if request.user != recurring_donation.donor and request.user.user_type not in ['STAFF', 'SHELTER']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        recurring_donation.cancel()
        
        return Response({
            'message': 'Recurring donation cancelled successfully',
            'status': recurring_donation.status
        })
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause a recurring donation"""
        recurring_donation = self.get_object()
        
        # Only allow the donor or staff to pause
        if request.user != recurring_donation.donor and request.user.user_type not in ['STAFF', 'SHELTER']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if recurring_donation.status != 'ACTIVE':
            return Response({'error': 'Can only pause active subscriptions'}, status=status.HTTP_400_BAD_REQUEST)
        
        recurring_donation.pause()
        
        return Response({
            'message': 'Recurring donation paused successfully',
            'status': recurring_donation.status
        })
    
    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Resume a paused recurring donation"""
        recurring_donation = self.get_object()
        
        # Only allow the donor or staff to resume
        if request.user != recurring_donation.donor and request.user.user_type not in ['STAFF', 'SHELTER']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if recurring_donation.status != 'PAUSED':
            return Response({'error': 'Can only resume paused subscriptions'}, status=status.HTTP_400_BAD_REQUEST)
        
        recurring_donation.resume()
        
        return Response({
            'message': 'Recurring donation resumed successfully',
            'status': recurring_donation.status,
            'next_payment_date': recurring_donation.next_payment_date
        })


class ImpactDashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for impact dashboard data - no model, just custom endpoints
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def overview_stats(self, request):
        """Get high-level impact statistics"""
        
        # Calculate date ranges
        now = timezone.now()
        this_year = now.year
        last_30_days = now - timedelta(days=30)
        
        # Total lifetime stats
        total_donations = Donation.objects.aggregate(
            total=Sum('amount'),
            count=Count('id')
        )
        
        # Recent activity (last 30 days)
        recent_donations = Donation.objects.filter(created_at__gte=last_30_days).aggregate(
            total=Sum('amount'),
            count=Count('id')
        )
        
        # Impact metrics from DonationImpact model
        impact_stats = DonationImpact.objects.aggregate(
            animals_helped=Sum('units_helped'),
            categories_count=Count('impact_category', distinct=True)
        )
        
        # Success stories count
        success_stories_count = SuccessStory.objects.count()
        featured_stories_count = SuccessStory.objects.filter(is_featured=True).count()
        
        # Calculate efficiency metrics
        from animals.models import Animal
        total_animals = Animal.objects.count()
        adopted_animals = Animal.objects.filter(status='ADOPTED').count()
        adoption_rate = (adopted_animals / total_animals * 100) if total_animals > 0 else 0
        
        return Response({
            'total_impact': {
                'total_donated': total_donations['total'] or 0,
                'total_donations_count': total_donations['count'],
                'animals_helped': impact_stats['animals_helped'] or 0,
                'success_stories': success_stories_count,
                'adoption_rate': round(adoption_rate, 1)
            },
            'recent_activity': {
                'donations_30_days': recent_donations['total'] or 0,
                'donations_count_30_days': recent_donations['count'],
                'featured_stories': featured_stories_count
            },
            'quick_stats': [
                {
                    'label': 'Total Raised',
                    'value': f"${total_donations['total'] or 0:,.2f}",
                    'icon': '💰',
                    'color': '#4caf50'
                },
                {
                    'label': 'Animals Helped',
                    'value': impact_stats['animals_helped'] or 0,
                    'icon': '🐕',
                    'color': '#2196f3'
                },
                {
                    'label': 'Success Stories',
                    'value': success_stories_count,
                    'icon': '🌟',
                    'color': '#ff9800'
                },
                {
                    'label': 'Adoption Rate',
                    'value': f"{adoption_rate:.1f}%",
                    'icon': '❤️',
                    'color': '#e91e63'
                }
            ]
        })
    
    @action(detail=False, methods=['get'])
    def impact_breakdown(self, request):
        """Get breakdown of impact by category"""
        
        # Get impact by category
        impact_by_category = DonationImpact.objects.values(
            'impact_category__name',
            'impact_category__category_type',
            'impact_category__color',
            'impact_category__icon',
            'impact_category__unit_name'
        ).annotate(
            total_amount=Sum('amount_allocated'),
            total_units=Sum('units_helped'),
            donation_count=Count('donation', distinct=True)
        ).order_by('-total_amount')
        
        # Format for charts
        chart_data = []
        pie_data = []
        
        for category in impact_by_category:
            chart_data.append({
                'category': category['impact_category__name'],
                'amount': float(category['total_amount'] or 0),
                'units_helped': category['total_units'] or 0,
                'unit_name': category['impact_category__unit_name'],
                'color': category['impact_category__color'],
                'icon': category['impact_category__icon'],
                'donations': category['donation_count']
            })
            
            pie_data.append({
                'name': category['impact_category__name'],
                'value': float(category['total_amount'] or 0),
                'color': category['impact_category__color'],
                'units': category['total_units'] or 0
            })
        
        return Response({
            'breakdown': chart_data,
            'pie_chart_data': pie_data,
            'total_categories': len(chart_data)
        })
    
    @action(detail=False, methods=['get'])
    def monthly_trends(self, request):
        """Get monthly donation and impact trends"""
        
        # Get last 12 months of data
        now = timezone.now()
        twelve_months_ago = now - timedelta(days=365)
        
        # Group donations by month
        monthly_data = []
        
        for i in range(12):
            month_start = (now - timedelta(days=30*i)).replace(day=1)
            month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
            
            month_donations = Donation.objects.filter(
                created_at__gte=month_start,
                created_at__lte=month_end
            ).aggregate(
                total=Sum('amount'),
                count=Count('id')
            )
            
            month_impacts = DonationImpact.objects.filter(
                date_achieved__gte=month_start,
                date_achieved__lte=month_end
            ).aggregate(
                animals_helped=Sum('units_helped')
            )
            
            monthly_data.insert(0, {  # Insert at beginning to maintain chronological order
                'month': month_start.strftime('%b %Y'),
                'month_short': month_start.strftime('%b'),
                'donations': float(month_donations['total'] or 0),
                'donation_count': month_donations['count'],
                'animals_helped': month_impacts['animals_helped'] or 0,
                'year': month_start.year,
                'month_num': month_start.month
            })
        
        return Response({
            'monthly_trends': monthly_data,
            'trend_summary': {
                'avg_monthly_donations': sum(m['donations'] for m in monthly_data) / 12,
                'avg_animals_helped': sum(m['animals_helped'] for m in monthly_data) / 12,
                'best_month': max(monthly_data, key=lambda x: x['donations']) if monthly_data else None
            }
        })
    
    @action(detail=False, methods=['get'])
    def success_stories(self, request):
        """Get success stories with before/after data"""
        
        featured_stories = SuccessStory.objects.filter(is_featured=True)[:6]
        recent_stories = SuccessStory.objects.exclude(is_featured=True)[:10]
        
        def format_story(story):
            return {
                'id': story.id,
                'title': story.title,
                'animal_name': story.animal.name or 'Unnamed',
                'animal_type': story.animal.animal_type,
                'story_text': story.story_text,
                'before_photo': story.before_photo,
                'after_photo': story.after_photo,
                'rescue_date': story.rescue_date,
                'adoption_date': story.adoption_date,
                'days_to_adoption': story.days_to_adoption,
                'total_cost': float(story.total_cost),
                'donations_count': story.enabled_by_donations.count(),
                'is_featured': story.is_featured
            }
        
        return Response({
            'featured_stories': [format_story(story) for story in featured_stories],
            'recent_stories': [format_story(story) for story in recent_stories],
            'total_stories': SuccessStory.objects.count(),
            'stories_this_month': SuccessStory.objects.filter(
                created_at__gte=timezone.now().replace(day=1)
            ).count()
        })
    
    @action(detail=False, methods=['get'])
    def donor_impact(self, request):
        """Get personal impact data for the current user"""
        
        user = request.user
        
        # Get or create donor impact summary
        summary, created = DonorImpactSummary.objects.get_or_create(
            donor=user,
            defaults={
                'total_donated': 0,
                'animals_helped': 0,
                'donations_count': 0
            }
        )
        
        # Get user's donations
        user_donations = Donation.objects.filter(donor=user)
        
        # Calculate personal impact
        personal_impact = user_donations.aggregate(
            total_donated=Sum('amount'),
            donation_count=Count('id')
        )
        
        # Get breakdown of user's impact by category
        user_impact_breakdown = DonationImpact.objects.filter(
            donation__donor=user
        ).values(
            'impact_category__name',
            'impact_category__color',
            'impact_category__unit_name'
        ).annotate(
            amount=Sum('amount_allocated'),
            units=Sum('units_helped')
        )
        
        # Recent donations
        recent_donations = user_donations.order_by('-created_at')[:5]
        
        return Response({
            'personal_stats': {
                'total_donated': float(personal_impact['total_donated'] or 0),
                'donations_count': personal_impact['donation_count'],
                'donor_level': summary.donor_level,
                'animals_helped': summary.animals_helped,
                'member_since': user.date_joined,
                'last_donation': recent_donations.first().created_at if recent_donations.exists() else None
            },
            'impact_breakdown': [
                {
                    'category': item['impact_category__name'],
                    'amount': float(item['amount'] or 0),
                    'units_helped': item['units'],
                    'unit_name': item['impact_category__unit_name'],
                    'color': item['impact_category__color']
                }
                for item in user_impact_breakdown
            ],
            'recent_donations': [
                {
                    'id': donation.id,
                    'amount': float(donation.amount),
                    'date': donation.created_at,
                    'campaign': donation.campaign.title if donation.campaign else 'General Fund'
                }
                for donation in recent_donations
            ],
            'donor_level_info': {
                'current_level': summary.donor_level,
                'progress_to_next': self._calculate_level_progress(float(personal_impact['total_donated'] or 0))
            }
        })
    
    def _calculate_level_progress(self, total_donated):
        """Calculate progress to next donor level"""
        levels = {
            'BRONZE': {'min': 0, 'max': 100, 'next': 'SILVER'},
            'SILVER': {'min': 101, 'max': 500, 'next': 'GOLD'},
            'GOLD': {'min': 501, 'max': 2000, 'next': 'PLATINUM'},
            'PLATINUM': {'min': 2001, 'max': 5000, 'next': 'DIAMOND'},
            'DIAMOND': {'min': 5000, 'max': None, 'next': None}
        }
        
        current_level = 'BRONZE'
        for level, bounds in levels.items():
            if total_donated >= bounds['min']:
                if bounds['max'] is None or total_donated <= bounds['max']:
                    current_level = level
                    break
        
        level_info = levels[current_level]
        if level_info['next']:
            next_threshold = levels[level_info['next']]['min']
            progress = min(100, (total_donated / next_threshold) * 100)
            remaining = max(0, next_threshold - total_donated)
        else:
            progress = 100
            remaining = 0
        
        return {
            'current_level': current_level,
            'next_level': level_info['next'],
            'progress_percentage': progress,
            'amount_to_next_level': remaining
        }