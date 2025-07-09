# dashboard/services.py - ENHANCED VERSION for SHELTER users

from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta, date
from reports.models import Report
from animals.models import Animal
from adoptions.models import AdoptionApplication
from donations.models import Donation
from users.models import User
from healthcare.models import VaccinationRecord, MedicalRecord, HealthStatus

def get_dashboard_stats():
    """Get key statistics for the dashboard - ENHANCED for SHELTER users"""
    # Time ranges
    now = timezone.now()
    last_week = now - timedelta(days=7)
    last_month = now - timedelta(days=30)
    today = now.date()
    
    # ENHANCED Animal statistics for SHELTER operations
    animal_stats = {
        'total_animals': Animal.objects.count(),
        'available_animals': Animal.objects.filter(status='AVAILABLE').count(),
        'adopted_animals': Animal.objects.filter(status='ADOPTED').count(),
        'under_treatment': Animal.objects.filter(status='UNDER_TREATMENT').count(),
        
        # NEW: Emergency and critical care metrics
        'urgent_medical': Animal.objects.filter(status='URGENT_MEDICAL').count(),
        'emergency_cases': Animal.objects.filter(priority_level='EMERGENCY').count(),
        'quarantine_cases': Animal.objects.filter(status='QUARANTINE').count(),
        'ready_for_transfer': Animal.objects.filter(status='READY_FOR_TRANSFER').count(),
        
        # NEW: Capacity and workflow metrics
        'in_shelter_total': Animal.objects.filter(status='IN_SHELTER').count(),
        'intake_this_week': Animal.objects.filter(
            intake_date__gte=last_week,
            status__in=['IN_SHELTER', 'UNDER_TREATMENT', 'QUARANTINE', 'URGENT_MEDICAL']
        ).count(),
        
        # NEW: Medical attention requirements
        'requiring_vaccination': get_animals_needing_vaccination(),
        'overdue_checkups': get_animals_overdue_checkups(),
        'quarantine_ending_soon': Animal.objects.filter(
            status='QUARANTINE',
            quarantine_end_date__lte=today + timedelta(days=3),
            quarantine_end_date__gte=today
        ).count(),
    }
    
    # FIXED Report statistics with proper completion rate calculation
    total_reports = Report.objects.count()
    completed_reports = Report.objects.filter(
        status__in=['COMPLETED', 'RESCUED', 'RELOCATED']
    ).count()
    
    report_stats = {
        'total_reports': total_reports,
        'pending_reports': Report.objects.filter(status='PENDING').count(),
        'in_progress_reports': Report.objects.filter(status__in=['ASSIGNED', 'IN_PROGRESS', 'INVESTIGATING']).count(),
        'recent_reports': Report.objects.filter(created_at__gt=last_week).count(),
        'completion_rate': round((completed_reports / total_reports * 100), 1) if total_reports > 0 else 0,
        
        # NEW: Emergency response metrics
        'emergency_reports': Report.objects.filter(urgency_level='EMERGENCY').count(),
        'high_priority_reports': Report.objects.filter(urgency_level='HIGH').count(),
        'avg_response_time_hours': calculate_avg_response_time(),
    }
    
    # ENHANCED Adoption statistics with realistic processing
    pending_applications = AdoptionApplication.objects.filter(status='PENDING')
    
    adoption_stats = {
        'total_applications': AdoptionApplication.objects.count(),
        'pending_applications': pending_applications.count(),
        'approved_applications': AdoptionApplication.objects.filter(status='APPROVED').count(),
        'recent_applications': AdoptionApplication.objects.filter(created_at__gt=last_week).count(),
        
        # NEW: Processing efficiency metrics
        'applications_over_7_days': pending_applications.filter(
            created_at__lt=now - timedelta(days=7)
        ).count(),
        'avg_processing_days': calculate_avg_processing_time(),
        'approval_rate': calculate_approval_rate(),
    }
    
    # EXISTING Donation statistics (keep as is)
    donation_stats = {
        'total_amount': Donation.objects.aggregate(Sum('amount'))['amount__sum'] or 0,
        'recent_amount': Donation.objects.filter(created_at__gt=last_month).aggregate(Sum('amount'))['amount__sum'] or 0,
        'donor_count': Donation.objects.values('donor').distinct().count(),
        'average_donation': Donation.objects.aggregate(Avg('amount'))['amount__avg'] or 0,
    }
    
    # ENHANCED User statistics
    user_stats = {
        'total_users': User.objects.count(),
        'new_users': User.objects.filter(date_joined__gt=last_month).count(),
        'active_volunteers': User.objects.filter(user_type='VOLUNTEER').count(),
        'shelters': User.objects.filter(user_type='SHELTER').count(),
    }
    
    # NEW: Operational capacity metrics for SHELTER users
    capacity_stats = get_capacity_stats()
    
    # NEW: Medical inventory alerts
    medical_alerts = get_medical_alerts()
    
    return {
        'animal_stats': animal_stats,
        'report_stats': report_stats,
        'adoption_stats': adoption_stats,
        'donation_stats': donation_stats,
        'user_stats': user_stats,
        'capacity_stats': capacity_stats,  # NEW
        'medical_alerts': medical_alerts,  # NEW
    }

def calculate_avg_response_time():
    """Calculate average response time for reports in hours"""
    from django.db.models import Avg
    from django.db.models.functions import Extract
    
    # Get reports that have been assigned (have response time)
    reports_with_response = Report.objects.filter(
        status__in=['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'RESCUED'],
        created_at__isnull=False
    ).exclude(assigned_to__isnull=True)
    
    if not reports_with_response.exists():
        return 0
    
    # Simple calculation - could be enhanced with actual assignment timestamps
    return 24  # Placeholder - replace with actual calculation based on your tracking

def calculate_avg_processing_time():
    """Calculate average application processing time in days"""
    processed_apps = AdoptionApplication.objects.filter(
        status__in=['APPROVED', 'REJECTED']
    )
    
    if not processed_apps.exists():
        return 0
    
    total_days = 0
    count = 0
    
    for app in processed_apps:
        if app.updated_at and app.created_at:
            days = (app.updated_at.date() - app.created_at.date()).days
            total_days += days
            count += 1
    
    return round(total_days / count, 1) if count > 0 else 0

def calculate_approval_rate():
    """Calculate adoption application approval rate"""
    total_processed = AdoptionApplication.objects.filter(
        status__in=['APPROVED', 'REJECTED']
    ).count()
    
    if total_processed == 0:
        return 0
    
    approved = AdoptionApplication.objects.filter(status='APPROVED').count()
    return round((approved / total_processed) * 100, 1)

def get_animals_needing_vaccination():
    """Get count of animals needing vaccination"""
    # Animals that haven't been vaccinated yet
    unvaccinated = Animal.objects.filter(vaccinated=False).count()
    
    # Animals with overdue vaccinations (placeholder logic)
    overdue_vaccinations = 0  # Implement based on VaccinationRecord next_due_date
    
    return unvaccinated + overdue_vaccinations

def get_animals_overdue_checkups():
    """Get count of animals overdue for checkups"""
    today = timezone.now().date()
    
    # Animals with health status records that are overdue
    overdue_count = HealthStatus.objects.filter(
        next_checkup_date__lt=today
    ).count()
    
    return overdue_count

def get_capacity_stats():
    """Get shelter capacity statistics"""
    # These would come from shelter configuration - using reasonable defaults
    max_capacity = 150  # This should come from shelter settings
    current_occupancy = Animal.objects.filter(
        status__in=['IN_SHELTER', 'UNDER_TREATMENT', 'QUARANTINE', 'URGENT_MEDICAL']
    ).count()
    
    capacity_percentage = round((current_occupancy / max_capacity) * 100, 1) if max_capacity > 0 else 0
    
    return {
        'current_occupancy': current_occupancy,
        'max_capacity': max_capacity,
        'capacity_percentage': capacity_percentage,
        'available_space': max_capacity - current_occupancy,
        'status': 'full' if capacity_percentage >= 95 else 'high' if capacity_percentage >= 80 else 'normal'
    }

def get_medical_alerts():
    """Get medical inventory and health alerts"""
    today = timezone.now().date()
    
    return {
        'low_vaccine_stock': 0,  # Would integrate with inventory system
        'expired_medications': 0,  # Would integrate with inventory system
        'animals_needing_urgent_care': Animal.objects.filter(
            Q(status='URGENT_MEDICAL') | Q(priority_level='EMERGENCY')
        ).count(),
        'quarantine_ending_today': Animal.objects.filter(
            status='QUARANTINE',
            quarantine_end_date=today
        ).count(),
        'overdue_medical_checkups': get_animals_overdue_checkups(),
    }

# EXISTING functions - keep as is but fix the completion rate calculation
def calculate_completion_rate():
    """Calculate the percentage of reports that are completed - FIXED VERSION"""
    total = Report.objects.count()
    if total == 0:
        return 0
    
    # Include all final status types as "completed"
    completed = Report.objects.filter(
        status__in=['COMPLETED', 'RESCUED', 'RELOCATED', 'CANCELLED']
    ).count()
    
    return round((completed / total) * 100, 1)

def get_report_trend_data():
    """Get report counts grouped by month for trend charts - EXISTING"""
    # Last 6 months of data
    now = timezone.now()
    six_months_ago = now - timedelta(days=180)
    
    reports = Report.objects.filter(created_at__gt=six_months_ago)
    
    # Group by month
    from django.db.models.functions import TruncMonth
    trend_data = (
        reports.annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )
    
    return list(trend_data)

def get_animal_status_distribution():
    """Get count of animals by status for pie charts - EXISTING"""
    statuses = Animal.objects.values('status').annotate(count=Count('id')).order_by('status')
    return list(statuses)