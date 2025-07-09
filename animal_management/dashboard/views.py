# dashboard/views.py - ENHANCED VERSION with new statistics for SHELTER users

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db.models import Count, Q, Avg, F 
from django.utils import timezone
from datetime import timedelta, date
from .services import (
    get_dashboard_stats,
    get_report_trend_data,
    get_animal_status_distribution
)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get key statistics for the dashboard - ENHANCED for SHELTER users"""
    # Only staff, shelter, and authorities can access the dashboard
    if request.user.user_type not in ['STAFF', 'SHELTER', 'AUTHORITY']:
        return Response({"error": "You don't have permission to access the dashboard"}, status=403)
    
    stats = get_dashboard_stats()
    
    # Add SHELTER-specific enhancements
    if request.user.user_type == 'SHELTER':
        stats = enhance_shelter_stats(stats, request.user)
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_trends(request):
    """Get report trends over time - ENHANCED with priority levels"""
    if request.user.user_type not in ['STAFF', 'SHELTER', 'AUTHORITY']:
        return Response({"error": "You don't have permission to access this data"}, status=403)
    
    trend_data = get_report_trend_data()
    
    # Add priority-based trends for SHELTER users
    if request.user.user_type == 'SHELTER':
        trend_data = enhance_report_trends(trend_data)
    
    return Response(trend_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def animal_distribution(request):
    """Get distribution of animals by status - ENHANCED with new statuses"""
    if request.user.user_type not in ['STAFF', 'SHELTER', 'AUTHORITY']:
        return Response({"error": "You don't have permission to access this data"}, status=403)
    
    distribution_data = get_animal_status_distribution()
    
    return Response(distribution_data)

# NEW: Medical dashboard endpoint for SHELTER users
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def medical_dashboard_stats(request):
    """Get medical-specific statistics for SHELTER users"""
    if request.user.user_type not in ['STAFF', 'SHELTER']:
        return Response({"error": "You don't have permission to access medical data"}, status=403)
    
    from animals.models import Animal
    from healthcare.models import VaccinationRecord, MedicalRecord, HealthStatus
    from inventory.models import InventoryItem
    
    now = timezone.now()
    last_week = now - timedelta(days=7)
    last_month = now - timedelta(days=30)
    today = now.date()
    
    # Medical statistics
    medical_stats = {
        'urgent_medical_cases': Animal.objects.filter(
            Q(status='URGENT_MEDICAL') | Q(priority_level='EMERGENCY')
        ).count(),
        
        'animals_under_treatment': Animal.objects.filter(status='UNDER_TREATMENT').count(),
        
        'quarantine_cases': Animal.objects.filter(status='QUARANTINE').count(),
        
        'animals_ready_for_transfer': Animal.objects.filter(status='READY_FOR_TRANSFER').count(),
        
        # Vaccination tracking
        'overdue_vaccinations': VaccinationRecord.objects.filter(
            next_due_date__lt=today
        ).count(),
        
        'vaccinations_due_soon': VaccinationRecord.objects.filter(
            next_due_date__gte=today,
            next_due_date__lte=today + timedelta(days=30)
        ).count(),
        
        # Medical records
        'recent_treatments': MedicalRecord.objects.filter(
            date__gte=last_week
        ).count(),
        
        'pending_followups': MedicalRecord.objects.filter(
            follow_up_required=True,
            follow_up_date__lte=today + timedelta(days=7)
        ).count(),
        
        # Health status tracking
        'animals_needing_checkup': HealthStatus.objects.filter(
            next_checkup_date__lte=today + timedelta(days=7)
        ).count(),
        
        'critical_health_cases': HealthStatus.objects.filter(
            current_status__in=['SICK', 'INJURED', 'CRITICAL']
        ).count(),
        
        # Medical inventory
        'low_stock_medical_items': InventoryItem.objects.filter(
            category__in=['medical', 'vaccines', 'medications'],
            quantity__lte=models.F('reorder_level')
        ).count(),
        
        'expired_medical_items': InventoryItem.objects.filter(
            category__in=['medical', 'vaccines', 'medications'],
            expiry_date__lte=today
        ).count(),
    }
    
    # Medical trends
    medical_trends = {
        'weekly_treatment_volume': get_weekly_treatment_volume(),
        'vaccination_compliance': get_vaccination_compliance(),
        'medical_cost_trends': get_medical_cost_trends(),
    }
    
    return Response({
        'medical_stats': medical_stats,
        'medical_trends': medical_trends,
        'alerts': get_medical_alerts(medical_stats)
    })

# NEW: Staff management endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_management_stats(request):
    """Get staff management statistics for SHELTER users"""
    if request.user.user_type != 'SHELTER':
        return Response({"error": "Only shelter users can access staff management"}, status=403)
    
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    # Staff statistics
    staff_stats = {
        'total_staff': User.objects.filter(user_type__in=['STAFF', 'VOLUNTEER']).count(),
        'active_staff': User.objects.filter(
            user_type__in=['STAFF', 'VOLUNTEER'],
            last_login__gte=timezone.now() - timedelta(days=7)
        ).count(),
        'staff_workload': get_staff_workload_distribution(),
        'performance_metrics': get_staff_performance_metrics(),
    }
    
    return Response(staff_stats)

# NEW: Capacity management endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def capacity_stats(request):
    """Get shelter capacity statistics"""
    if request.user.user_type not in ['STAFF', 'SHELTER']:
        return Response({"error": "Permission denied"}, status=403)
    
    from animals.models import Animal
    
    # Calculate capacity (this should come from shelter configuration)
    max_capacity = 150  # This should be configurable per shelter
    
    current_occupancy = Animal.objects.filter(
        status__in=['IN_SHELTER', 'UNDER_TREATMENT', 'QUARANTINE', 'URGENT_MEDICAL']
    ).count()
    
    capacity_stats = {
        'max_capacity': max_capacity,
        'current_occupancy': current_occupancy,
        'available_space': max_capacity - current_occupancy,
        'capacity_percentage': round((current_occupancy / max_capacity) * 100, 1) if max_capacity > 0 else 0,
        'status': get_capacity_status(current_occupancy, max_capacity),
        
        # Projected capacity based on trends
        'projected_occupancy_7_days': project_occupancy(7),
        'projected_occupancy_30_days': project_occupancy(30),
        
        # Capacity by animal type
        'capacity_by_type': get_capacity_by_animal_type(),
    }
    
    return Response(capacity_stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_alerts(request):
    """Get real-time alerts for dashboard"""
    if request.user.user_type not in ['STAFF', 'SHELTER', 'AUTHORITY']:
        return Response({"error": "Permission denied"}, status=403)
    
    from animals.models import Animal
    from reports.models import Report
    from healthcare.models import VaccinationRecord
    from inventory.models import InventoryItem
    
    alerts = []
    
    try:
        # Emergency animal cases
        emergency_animals = Animal.objects.filter(
            Q(status='URGENT_MEDICAL') | Q(priority_level='EMERGENCY')
        ).count()
        
        if emergency_animals > 0:
            alerts.append({
                'type': 'emergency',
                'title': 'Emergency Medical Cases',
                'message': f'{emergency_animals} animals require immediate medical attention',
                'count': emergency_animals,
                'action_url': '/medical-management',
                'action_text': 'View Medical Management'
            })
        
        # Emergency reports
        emergency_reports = Report.objects.filter(
            urgency_level='EMERGENCY',
            status__in=['PENDING', 'ASSIGNED']
        ).count()
        
        if emergency_reports > 0:
            alerts.append({
                'type': 'emergency',
                'title': 'Emergency Reports',
                'message': f'{emergency_reports} emergency reports need immediate response',
                'count': emergency_reports,
                'action_url': '/reports',
                'action_text': 'View Reports'
            })
        
        # Overdue vaccinations
        overdue_vaccinations = VaccinationRecord.objects.filter(
            next_due_date__lt=timezone.now().date()
        ).count()
        
        if overdue_vaccinations > 0:
            alerts.append({
                'type': 'warning',
                'title': 'Overdue Vaccinations',
                'message': f'{overdue_vaccinations} vaccinations are overdue',
                'count': overdue_vaccinations,
                'action_url': '/medical-management',
                'action_text': 'Schedule Vaccinations'
            })
        
        # Low stock medical supplies
        low_stock_items = InventoryItem.objects.filter(
            category__in=['medical', 'vaccines', 'medications']
        ).filter(
            quantity__lte=F('reorder_level')
        ).count()
        
        if low_stock_items > 0:
            alerts.append({
                'type': 'info',
                'title': 'Low Medical Stock',
                'message': f'{low_stock_items} medical supplies are running low',
                'count': low_stock_items,
                'action_url': '/inventory/dashboard',
                'action_text': 'Check Inventory'
            })
        
        # Capacity warnings
        current_occupancy = Animal.objects.filter(
            status__in=['IN_SHELTER', 'UNDER_TREATMENT', 'QUARANTINE', 'URGENT_MEDICAL']
        ).count()
        max_capacity = 150  # Should be configurable
        
        if current_occupancy >= max_capacity * 0.9:  # 90% capacity
            alerts.append({
                'type': 'warning',
                'title': 'High Capacity',
                'message': f'Shelter is at {round((current_occupancy/max_capacity)*100)}% capacity',
                'count': current_occupancy,
                'action_url': '/dashboard',
                'action_text': 'View Capacity'
            })
        
    except Exception as e:
        # If there's an error, return empty alerts rather than failing
        print(f"Error getting dashboard alerts: {e}")
        alerts = []
    
    return Response({
        'alerts': alerts,
        'total_count': len(alerts),
        'last_updated': timezone.now().isoformat()
    })

# NEW: Emergency status endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_emergency_status(request):
    """Get current emergency status summary"""
    if request.user.user_type not in ['STAFF', 'SHELTER', 'AUTHORITY']:
        return Response({"error": "Permission denied"}, status=403)
    
    from animals.models import Animal
    from reports.models import Report
    
    try:
        # Emergency animals
        urgent_animals = Animal.objects.filter(
            Q(status='URGENT_MEDICAL') | Q(priority_level='EMERGENCY')
        )
        
        # Emergency reports
        emergency_reports = Report.objects.filter(
            urgency_level='EMERGENCY',
            status__in=['PENDING', 'ASSIGNED']
        )
        
        # Active rescue operations
        active_rescues = Report.objects.filter(
            status='RESCUE_IN_PROGRESS'
        )
        
        emergency_status = {
            'overall_status': 'normal',  # Will be updated based on counts
            'urgent_animals': {
                'count': urgent_animals.count(),
                'animals': [{
                    'id': animal.id,
                    'name': animal.name or 'Unnamed',
                    'type': animal.animal_type,
                    'status': animal.status,
                    'priority': animal.priority_level,
                    'condition': animal.health_status
                } for animal in urgent_animals[:5]]  # Limit to 5 for performance
            },
            'emergency_reports': {
                'count': emergency_reports.count(),
                'reports': [{
                    'id': report.id,
                    'description': report.description[:100] + '...' if len(report.description) > 100 else report.description,
                    'location': report.location_details,
                    'urgency': report.urgency_level,
                    'created_at': report.created_at.isoformat()
                } for report in emergency_reports[:5]]
            },
            'active_rescues': {
                'count': active_rescues.count(),
                'operations': [{
                    'id': rescue.id,
                    'description': rescue.description[:100] + '...' if len(rescue.description) > 100 else rescue.description,
                    'location': rescue.location_details,
                    'assigned_to': rescue.assigned_to.username if rescue.assigned_to else 'Unassigned'
                } for rescue in active_rescues[:5]]
            }
        }
        
        # Determine overall status
        total_emergencies = urgent_animals.count() + emergency_reports.count() + active_rescues.count()
        
        if total_emergencies == 0:
            emergency_status['overall_status'] = 'normal'
        elif total_emergencies <= 2:
            emergency_status['overall_status'] = 'moderate'
        elif total_emergencies <= 5:
            emergency_status['overall_status'] = 'high'
        else:
            emergency_status['overall_status'] = 'critical'
        
        emergency_status['total_emergencies'] = total_emergencies
        emergency_status['last_updated'] = timezone.now().isoformat()
        
        return Response(emergency_status)
        
    except Exception as e:
        return Response({
            'error': f'Error getting emergency status: {str(e)}',
            'overall_status': 'unknown',
            'total_emergencies': 0
        }, status=500)


# Helper functions
def enhance_shelter_stats(stats, user):
    """Add SHELTER-specific enhancements to dashboard stats"""
    from animals.models import Animal
    from reports.models import Report
    
    # Add emergency metrics
    stats['emergency_metrics'] = {
        'urgent_cases': Animal.objects.filter(
            Q(status='URGENT_MEDICAL') | Q(priority_level='EMERGENCY')
        ).count(),
        'emergency_reports': Report.objects.filter(urgency_level='EMERGENCY').count(),
        'response_time_avg': calculate_avg_response_time(),
    }
    
    # Add capacity information
    stats['capacity_info'] = get_capacity_summary()
    
    # Add medical alerts
    stats['medical_alerts'] = get_immediate_medical_alerts()
    
    return stats

def enhance_report_trends(trend_data):
    """Add priority-based trends to report data"""
    from reports.models import Report
    from django.db.models.functions import TruncMonth
    
    # Add priority breakdown to existing trend data
    priority_trends = (
        Report.objects.filter(created_at__gt=timezone.now() - timedelta(days=180))
        .annotate(month=TruncMonth('created_at'))
        .values('month', 'urgency_level')
        .annotate(count=Count('id'))
        .order_by('month', 'urgency_level')
    )
    
    # Group by month and add priority breakdown
    enhanced_trends = []
    for trend in trend_data:
        month_priorities = priority_trends.filter(month=trend['month'])
        trend['priority_breakdown'] = {
            'emergency': month_priorities.filter(urgency_level='EMERGENCY').aggregate(Count('id'))['id__count'] or 0,
            'high': month_priorities.filter(urgency_level='HIGH').aggregate(Count('id'))['id__count'] or 0,
            'normal': month_priorities.filter(urgency_level='NORMAL').aggregate(Count('id'))['id__count'] or 0,
        }
        enhanced_trends.append(trend)
    
    return enhanced_trends

def get_weekly_treatment_volume():
    """Get weekly treatment volume trends"""
    from healthcare.models import MedicalRecord
    
    last_8_weeks = []
    for i in range(8):
        week_start = timezone.now().date() - timedelta(weeks=i+1)
        week_end = week_start + timedelta(days=7)
        
        treatments = MedicalRecord.objects.filter(
            date__gte=week_start,
            date__lt=week_end
        ).count()
        
        last_8_weeks.append({
            'week': week_start.strftime('%Y-%m-%d'),
            'treatments': treatments
        })
    
    return list(reversed(last_8_weeks))

def get_vaccination_compliance():
    """Calculate vaccination compliance rate"""
    from healthcare.models import VaccinationRecord
    from animals.models import Animal
    
    total_animals = Animal.objects.filter(
        status__in=['IN_SHELTER', 'UNDER_TREATMENT', 'AVAILABLE']
    ).count()
    
    if total_animals == 0:
        return 100
    
    vaccinated_animals = Animal.objects.filter(
        status__in=['IN_SHELTER', 'UNDER_TREATMENT', 'AVAILABLE'],
        vaccinated=True
    ).count()
    
    return round((vaccinated_animals / total_animals) * 100, 1)

def get_medical_cost_trends():
    """Get medical cost trends over time"""
    from healthcare.models import MedicalRecord
    
    last_6_months = []
    for i in range(6):
        month_start = (timezone.now().date().replace(day=1) - timedelta(days=i*30))
        month_end = month_start + timedelta(days=30)
        
        # This would need actual cost tracking in the model
        # For now, return placeholder data
        cost = MedicalRecord.objects.filter(
            date__gte=month_start,
            date__lt=month_end
        ).count() * 50  # Placeholder calculation
        
        last_6_months.append({
            'month': month_start.strftime('%Y-%m'),
            'cost': cost
        })
    
    return list(reversed(last_6_months))

def get_medical_alerts(medical_stats):
    """Generate medical alerts based on statistics"""
    alerts = []
    
    if medical_stats['urgent_medical_cases'] > 0:
        alerts.append({
            'type': 'emergency',
            'message': f"{medical_stats['urgent_medical_cases']} animals require urgent medical attention",
            'action': 'Review medical management dashboard'
        })
    
    if medical_stats['overdue_vaccinations'] > 0:
        alerts.append({
            'type': 'warning',
            'message': f"{medical_stats['overdue_vaccinations']} vaccinations are overdue",
            'action': 'Schedule vaccination appointments'
        })
    
    if medical_stats['low_stock_medical_items'] > 0:
        alerts.append({
            'type': 'info',
            'message': f"{medical_stats['low_stock_medical_items']} medical supplies are low in stock",
            'action': 'Review inventory and reorder'
        })
    
    return alerts

def calculate_avg_response_time():
    """Calculate average response time for reports"""
    # Placeholder implementation
    return 24  # hours

def get_capacity_summary():
    """Get shelter capacity summary"""
    from animals.models import Animal
    
    total_animals = Animal.objects.filter(
        status__in=['IN_SHELTER', 'UNDER_TREATMENT', 'QUARANTINE', 'URGENT_MEDICAL']
    ).count()
    
    max_capacity = 150  # Should be configurable
    
    return {
        'current': total_animals,
        'maximum': max_capacity,
        'percentage': round((total_animals / max_capacity) * 100, 1) if max_capacity > 0 else 0,
        'status': 'full' if total_animals >= max_capacity * 0.95 else 'high' if total_animals >= max_capacity * 0.8 else 'normal'
    }

def get_immediate_medical_alerts():
    """Get immediate medical alerts for dashboard"""
    from animals.models import Animal
    from healthcare.models import VaccinationRecord
    
    alerts = []
    
    # Emergency cases
    emergency_count = Animal.objects.filter(
        Q(status='URGENT_MEDICAL') | Q(priority_level='EMERGENCY')
    ).count()
    
    if emergency_count > 0:
        alerts.append({
            'type': 'emergency',
            'count': emergency_count,
            'message': 'animals need emergency care'
        })
    
    # Overdue vaccinations
    overdue_count = VaccinationRecord.objects.filter(
        next_due_date__lt=timezone.now().date()
    ).count()
    
    if overdue_count > 0:
        alerts.append({
            'type': 'warning',
            'count': overdue_count,
            'message': 'vaccinations are overdue'
        })
    
    return alerts

def get_staff_workload_distribution():
    """Get staff workload distribution"""
    # Placeholder implementation
    return []

def get_staff_performance_metrics():
    """Get staff performance metrics"""
    # Placeholder implementation
    return {}

def get_capacity_status(current, maximum):
    """Determine capacity status"""
    percentage = (current / maximum) * 100 if maximum > 0 else 0
    
    if percentage >= 95:
        return 'critical'
    elif percentage >= 80:
        return 'high'
    elif percentage >= 60:
        return 'moderate'
    else:
        return 'normal'

def project_occupancy(days):
    """Project future occupancy based on trends"""
    # Placeholder implementation - would use historical data
    from animals.models import Animal
    current = Animal.objects.filter(
        status__in=['IN_SHELTER', 'UNDER_TREATMENT', 'QUARANTINE', 'URGENT_MEDICAL']
    ).count()
    
    # Simple projection - in reality would use trend analysis
    return current + (days * 0.5)  # Assuming 0.5 animals per day increase

def get_capacity_by_animal_type():
    """Get capacity breakdown by animal type"""
    from animals.models import Animal
    
    return list(Animal.objects.filter(
        status__in=['IN_SHELTER', 'UNDER_TREATMENT', 'QUARANTINE', 'URGENT_MEDICAL']
    ).values('animal_type').annotate(count=Count('id')).order_by('animal_type'))