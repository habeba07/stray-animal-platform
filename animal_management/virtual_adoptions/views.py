from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import VirtualAdoption, VirtualAdoptionUpdate, VirtualAdoptionLevel
from .serializers import (
    VirtualAdoptionSerializer, 
    VirtualAdoptionUpdateSerializer,
    VirtualAdoptionLevelSerializer
)
from animals.models import Animal
from decimal import Decimal
import uuid

class VirtualAdoptionLevelViewSet(viewsets.ModelViewSet):
    queryset = VirtualAdoptionLevel.objects.filter(is_active=True)
    serializer_class = VirtualAdoptionLevelSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]


class VirtualAdoptionViewSet(viewsets.ModelViewSet):
    queryset = VirtualAdoption.objects.all()
    serializer_class = VirtualAdoptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return VirtualAdoption.objects.all()
        return VirtualAdoption.objects.filter(sponsor=self.request.user)
    
    def perform_create(self, serializer):
        # Get animal
        animal_id = self.request.data.get('animal')
        animal = Animal.objects.get(id=animal_id)
        
        # Calculate next payment date
        period = self.request.data.get('period', 'MONTHLY')
        next_payment_date = self.calculate_next_payment_date(period)
        
        # Save the virtual adoption
        virtual_adoption = serializer.save(
            sponsor=self.request.user,
            next_payment_date=next_payment_date,
            start_date=timezone.now().date()
        )
        
        # Process initial payment (in a real system, this would connect to a payment gateway)
        amount = Decimal(self.request.data.get('amount'))
        self.process_payment(virtual_adoption, amount)
        
        # Award points for virtual adoption
        from community.services import award_points
        award_points(self.request.user, 'VIRTUAL_ADOPTION', animal)
    
    def calculate_next_payment_date(self, period):
        today = timezone.now().date()  
        
        if period == 'MONTHLY':
            next_date = today.replace(day=1) + timezone.timedelta(days=32)
            return next_date.replace(day=1)
        elif period == 'QUARTERLY':
            next_month = today.month + 3
            next_year = today.year + (next_month > 12)
            next_month = (next_month - 1) % 12 + 1
            return today.replace(year=next_year, month=next_month, day=1)
        elif period == 'ANNUALLY':
            return today.replace(year=today.year + 1)
        
        return today
    
    def process_payment(self, virtual_adoption, amount):
        """
        In a real system, this would integrate with a payment gateway.
        For now, we'll just log the payment in the donation system.
        """
        try:
            from donations.models import Donation, DonationCampaign
            
            # Find or create a campaign for virtual adoptions
            campaign, created = DonationCampaign.objects.get_or_create(
                title="Virtual Adoptions",
                defaults={
                    'description': "Support for virtually adopted animals",
                    'campaign_type': 'SPECIFIC_ANIMAL',
                    'target_amount': Decimal('10000.00'),
                    'start_date': timezone.now().date(),
                    'end_date': timezone.now().date().replace(year=timezone.now().year + 1),
                    'animal': virtual_adoption.animal,
                    'created_by': self.request.user,
                }
            )
            
            # Create donation record
            Donation.objects.create(
                donor=self.request.user,
                campaign=campaign,
                amount=amount,
                payment_method='CREDIT_CARD',  # Default for now
                transaction_id=str(uuid.uuid4()),
                is_anonymous=False,
                message=f"Virtual adoption of {virtual_adoption.animal.name or 'unnamed animal'}"
            )
            
            # Update campaign amount
            campaign.current_amount += amount
            campaign.save()
            
        except ImportError:
            # Donations module might not be available
            pass
    
    @action(detail=False, methods=['get'])
    def my_adoptions(self, request):
        """Get current user's virtual adoptions"""
        adoptions = self.queryset.filter(sponsor=request.user)
        serializer = self.get_serializer(adoptions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a virtual adoption"""
        adoption = self.get_object()
        
        if adoption.sponsor != request.user and not request.user.is_staff:
            return Response(
                {"detail": "You don't have permission to cancel this adoption"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        adoption.status = 'CANCELLED'
        adoption.end_date = timezone.now().date()
        adoption.save()
        
        serializer = self.get_serializer(adoption)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause a virtual adoption"""
        adoption = self.get_object()
        
        if adoption.sponsor != request.user and not request.user.is_staff:
            return Response(
                {"detail": "You don't have permission to pause this adoption"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        adoption.status = 'PAUSED'
        adoption.save()
        
        serializer = self.get_serializer(adoption)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Resume a paused virtual adoption"""
        adoption = self.get_object()
        
        if adoption.sponsor != request.user and not request.user.is_staff:
            return Response(
                {"detail": "You don't have permission to resume this adoption"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if adoption.status != 'PAUSED':
            return Response(
                {"detail": "Only paused adoptions can be resumed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        adoption.status = 'ACTIVE'
        adoption.next_payment_date = self.calculate_next_payment_date(adoption.period)
        adoption.save()
        
        serializer = self.get_serializer(adoption)
        return Response(serializer.data)


class VirtualAdoptionUpdateViewSet(viewsets.ModelViewSet):
    queryset = VirtualAdoptionUpdate.objects.all()
    serializer_class = VirtualAdoptionUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        adoption_id = self.request.query_params.get('adoption_id')
        if adoption_id:
            return VirtualAdoptionUpdate.objects.filter(virtual_adoption_id=adoption_id)
        
        if self.request.user.is_staff:
            return VirtualAdoptionUpdate.objects.all()
        
        # Users can see updates for their own adoptions
        adoptions = VirtualAdoption.objects.filter(sponsor=self.request.user)
        return VirtualAdoptionUpdate.objects.filter(virtual_adoption__in=adoptions)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
