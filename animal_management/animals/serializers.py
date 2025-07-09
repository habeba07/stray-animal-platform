# animals/serializers.py - ENHANCED VERSION with new fields for SHELTER operations

from rest_framework import serializers
from .models import Animal
from users.serializers import UserSerializer

class AnimalSerializer(serializers.ModelSerializer):
    current_shelter_details = UserSerializer(source='current_shelter', read_only=True)
    location = serializers.SerializerMethodField()
    
    # NEW: Add computed fields for SHELTER operations
    days_in_shelter = serializers.SerializerMethodField()
    is_emergency = serializers.SerializerMethodField() 
    is_quarantine_complete = serializers.SerializerMethodField()
    
    # NEW: Add status display names for frontend
    status_display = serializers.SerializerMethodField()
    priority_display = serializers.SerializerMethodField()
    
    # NEW: Add health summary fields
    health_summary = serializers.SerializerMethodField()
    next_medical_action = serializers.SerializerMethodField()
    
    class Meta:
        model = Animal
        fields = [
            # Basic information (existing)
            'id', 'name', 'animal_type', 'breed', 'gender', 'age_estimate', 
            'weight', 'color', 'status', 'intake_date', 'location',
            'last_location_json', 'current_shelter', 'current_shelter_details', 
            'vaccinated', 'neutered_spayed', 'microchipped', 'health_status', 
            'behavior_notes', 'special_needs', 'adoption_fee', 
            'photos', 'created_at', 'updated_at',
            
            # NEW: Enhanced fields for SHELTER operations
            'priority_level', 'estimated_medical_cost', 'quarantine_end_date',
            'transfer_ready_date', 'special_instructions',
            
            # NEW: Computed fields
            'days_in_shelter', 'is_emergency', 'is_quarantine_complete',
            'status_display', 'priority_display', 'health_summary', 'next_medical_action'
        ]
        read_only_fields = ['created_at', 'updated_at', 'days_in_shelter', 
                           'is_emergency', 'is_quarantine_complete']

    def get_location(self, obj):
        return obj.location
    
    def get_days_in_shelter(self, obj):
        """Calculate days since intake for shelter operations"""
        return obj.days_in_shelter
    
    def get_is_emergency(self, obj):
        """Check if animal requires emergency attention"""
        return obj.is_emergency
    
    def get_is_quarantine_complete(self, obj):
        """Check if quarantine period is complete"""
        return obj.is_quarantine_complete
    
    def get_status_display(self, obj):
        """Get human-readable status display"""
        status_map = {
            'REPORTED': 'Reported',
            'RESCUED': 'Rescued',
            'IN_SHELTER': 'In Shelter',
            'UNDER_TREATMENT': 'Under Treatment',
            'QUARANTINE': 'In Quarantine',
            'URGENT_MEDICAL': 'Urgent Medical Attention',
            'READY_FOR_TRANSFER': 'Ready for Transfer',
            'AVAILABLE': 'Available for Adoption',
            'ADOPTED': 'Adopted',
            'RETURNED': 'Returned to Owner',
        }
        return status_map.get(obj.status, obj.status)
    
    def get_priority_display(self, obj):
        """Get human-readable priority display"""
        priority_map = {
            'LOW': 'Low Priority',
            'NORMAL': 'Normal',
            'HIGH': 'High Priority',
            'EMERGENCY': 'Emergency',
        }
        return priority_map.get(obj.priority_level, obj.priority_level)
    
    def get_health_summary(self, obj):
        """Get comprehensive health summary for shelter operations"""
        from healthcare.models import VaccinationRecord, MedicalRecord, HealthStatus
        from django.utils import timezone
        
        summary = {
            'vaccination_status': 'unknown',
            'last_checkup': None,
            'next_vaccination_due': None,
            'current_treatments': 0,
            'health_alerts': []
        }
        
        try:
            # Get latest health status
            health_status = HealthStatus.objects.filter(animal=obj).first()
            if health_status:
                summary['last_checkup'] = health_status.last_checkup_date
                summary['next_checkup'] = health_status.next_checkup_date
                summary['current_status'] = health_status.current_status
            
            # Get vaccination status
            vaccinations = VaccinationRecord.objects.filter(animal=obj)
            if vaccinations.exists():
                # Check if any vaccinations are overdue
                overdue_vaccinations = vaccinations.filter(
                    next_due_date__lt=timezone.now().date()
                ).count()
                
                if overdue_vaccinations > 0:
                    summary['vaccination_status'] = 'overdue'
                    summary['health_alerts'].append(f'{overdue_vaccinations} vaccination(s) overdue')
                else:
                    summary['vaccination_status'] = 'up_to_date'
                
                # Get next vaccination due
                next_vaccination = vaccinations.filter(
                    next_due_date__gte=timezone.now().date()
                ).order_by('next_due_date').first()
                
                if next_vaccination:
                    summary['next_vaccination_due'] = next_vaccination.next_due_date
            
            # Get current treatments
            recent_treatments = MedicalRecord.objects.filter(
                animal=obj,
                date__gte=timezone.now().date() - timezone.timedelta(days=30)
            )
            summary['current_treatments'] = recent_treatments.count()
            
            # Check for follow-up requirements
            pending_followups = recent_treatments.filter(
                follow_up_required=True,
                follow_up_date__lte=timezone.now().date()
            ).count()
            
            if pending_followups > 0:
                summary['health_alerts'].append(f'{pending_followups} follow-up(s) required')
            
            # Add quarantine alert
            if obj.status == 'QUARANTINE' and obj.quarantine_end_date:
                days_remaining = (obj.quarantine_end_date - timezone.now().date()).days
                if days_remaining <= 3:
                    summary['health_alerts'].append(f'Quarantine ends in {days_remaining} day(s)')
            
        except Exception as e:
            # If health data fetching fails, return basic summary
            summary['health_alerts'].append('Error loading health data')
        
        return summary
    
    def get_next_medical_action(self, obj):
        """Get next recommended medical action"""
        from healthcare.models import VaccinationRecord, MedicalRecord, HealthStatus
        from django.utils import timezone
        
        actions = []
        
        try:
            # Check for overdue vaccinations
            overdue_vaccinations = VaccinationRecord.objects.filter(
                animal=obj,
                next_due_date__lt=timezone.now().date()
            ).order_by('next_due_date')
            
            if overdue_vaccinations.exists():
                next_overdue = overdue_vaccinations.first()
                days_overdue = (timezone.now().date() - next_overdue.next_due_date).days
                actions.append({
                    'type': 'vaccination',
                    'priority': 'high' if days_overdue > 30 else 'medium',
                    'description': f'{next_overdue.vaccine_type} vaccination ({days_overdue} days overdue)',
                    'due_date': next_overdue.next_due_date
                })
            
            # Check for upcoming vaccinations
            upcoming_vaccinations = VaccinationRecord.objects.filter(
                animal=obj,
                next_due_date__gte=timezone.now().date(),
                next_due_date__lte=timezone.now().date() + timezone.timedelta(days=30)
            ).order_by('next_due_date')
            
            if upcoming_vaccinations.exists() and not overdue_vaccinations.exists():
                next_upcoming = upcoming_vaccinations.first()
                days_until = (next_upcoming.next_due_date - timezone.now().date()).days
                actions.append({
                    'type': 'vaccination',
                    'priority': 'low' if days_until > 14 else 'medium',
                    'description': f'{next_upcoming.vaccine_type} vaccination due soon',
                    'due_date': next_upcoming.next_due_date
                })
            
            # Check for pending follow-ups
            pending_followups = MedicalRecord.objects.filter(
                animal=obj,
                follow_up_required=True,
                follow_up_date__lte=timezone.now().date() + timezone.timedelta(days=7)
            ).order_by('follow_up_date')
            
            if pending_followups.exists():
                next_followup = pending_followups.first()
                actions.append({
                    'type': 'followup',
                    'priority': 'high',
                    'description': f'Follow-up for {next_followup.reason}',
                    'due_date': next_followup.follow_up_date
                })
            
            # Check for health checkup
            health_status = HealthStatus.objects.filter(animal=obj).first()
            if health_status and health_status.next_checkup_date:
                if health_status.next_checkup_date <= timezone.now().date() + timezone.timedelta(days=7):
                    actions.append({
                        'type': 'checkup',
                        'priority': 'medium',
                        'description': 'Routine health checkup',
                        'due_date': health_status.next_checkup_date
                    })
            
            # Check emergency status
            if obj.priority_level == 'EMERGENCY' or obj.status == 'URGENT_MEDICAL':
                actions.insert(0, {  # Insert at beginning for highest priority
                    'type': 'emergency',
                    'priority': 'emergency',
                    'description': 'Emergency medical attention required',
                    'due_date': timezone.now().date()
                })
            
        except Exception as e:
            actions.append({
                'type': 'error',
                'priority': 'low',
                'description': 'Error loading medical schedule',
                'due_date': None
            })
        
        # Return the highest priority action
        if actions:
            priority_order = {'emergency': 0, 'high': 1, 'medium': 2, 'low': 3}
            actions.sort(key=lambda x: priority_order.get(x['priority'], 4))
            return actions[0]
        
        return {
            'type': 'routine',
            'priority': 'low',
            'description': 'No immediate medical actions required',
            'due_date': None
        }


class AnimalDetailSerializer(AnimalSerializer):
    """Extended serializer for detailed animal views with additional relationships"""
    
    # Include related health data for detailed views
    recent_vaccinations = serializers.SerializerMethodField()
    recent_medical_records = serializers.SerializerMethodField()
    adoption_applications_count = serializers.SerializerMethodField()
    
    class Meta(AnimalSerializer.Meta):
        fields = AnimalSerializer.Meta.fields + [
            'recent_vaccinations', 'recent_medical_records', 'adoption_applications_count'
        ]
    
    def get_recent_vaccinations(self, obj):
        """Get recent vaccinations (last 6 months)"""
        from healthcare.models import VaccinationRecord
        from django.utils import timezone
        
        six_months_ago = timezone.now().date() - timezone.timedelta(days=180)
        recent_vaccinations = VaccinationRecord.objects.filter(
            animal=obj,
            date_administered__gte=six_months_ago
        ).order_by('-date_administered')[:5]
        
        return [{
            'id': vacc.id,
            'vaccine_type': vacc.vaccine_type,
            'date_administered': vacc.date_administered,
            'next_due_date': vacc.next_due_date,
            'veterinarian': vacc.veterinarian
        } for vacc in recent_vaccinations]
    
    def get_recent_medical_records(self, obj):
        """Get recent medical records (last 3 months)"""
        from healthcare.models import MedicalRecord
        from django.utils import timezone
        
        three_months_ago = timezone.now().date() - timezone.timedelta(days=90)
        recent_records = MedicalRecord.objects.filter(
            animal=obj,
            date__gte=three_months_ago
        ).order_by('-date')[:5]
        
        return [{
            'id': record.id,
            'record_type': record.record_type,
            'reason': record.reason,
            'date': record.date,
            'veterinarian': record.veterinarian,
            'follow_up_required': record.follow_up_required
        } for record in recent_records]
    
    def get_adoption_applications_count(self, obj):
        """Get count of adoption applications for this animal"""
        return obj.adoption_applications.count() if hasattr(obj, 'adoption_applications') else 0


class AnimalListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for animal lists with essential info only"""
    
    location = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    priority_display = serializers.SerializerMethodField()
    is_emergency = serializers.SerializerMethodField()
    days_in_shelter = serializers.SerializerMethodField()
    
    class Meta:
        model = Animal
        fields = [
            'id', 'name', 'animal_type', 'breed', 'gender', 'age_estimate',
            'color', 'status', 'priority_level', 'photos', 'location',
            'health_status', 'special_instructions', 'adoption_fee',
            'status_display', 'priority_display', 'is_emergency', 'days_in_shelter'
        ]
    
    def get_location(self, obj):
        return obj.location
    
    def get_status_display(self, obj):
        status_map = {
            'REPORTED': 'Reported',
            'RESCUED': 'Rescued', 
            'IN_SHELTER': 'In Shelter',
            'UNDER_TREATMENT': 'Under Treatment',
            'QUARANTINE': 'In Quarantine',
            'URGENT_MEDICAL': 'Urgent Medical Attention',
            'READY_FOR_TRANSFER': 'Ready for Transfer',
            'AVAILABLE': 'Available for Adoption',
            'ADOPTED': 'Adopted',
            'RETURNED': 'Returned to Owner',
        }
        return status_map.get(obj.status, obj.status)
    
    def get_priority_display(self, obj):
        priority_map = {
            'LOW': 'Low Priority',
            'NORMAL': 'Normal',
            'HIGH': 'High Priority', 
            'EMERGENCY': 'Emergency',
        }
        return priority_map.get(obj.priority_level, obj.priority_level)
    
    def get_is_emergency(self, obj):
        return obj.is_emergency
    
    def get_days_in_shelter(self, obj):
        return obj.days_in_shelter