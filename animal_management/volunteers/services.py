from django.utils import timezone
from django.db.models import Q
from geopy.distance import geodesic
from geopy.geocoders import Nominatim
from .models import VolunteerProfile, RescueVolunteerAssignment
import logging

logger = logging.getLogger(__name__)


class RescueVolunteerService:
    """Service class for managing volunteer rescue operations"""
    
    @staticmethod
    def calculate_distance(address1, address2):
        """Calculate distance between two addresses using geocoding"""
        try:
            geolocator = Nominatim(user_agent="stray_animal_platform")
            
            # Handle different input formats
            if isinstance(address1, tuple):
                coords1 = address1
            else:
                loc1 = geolocator.geocode(address1)
                if not loc1:
                    return 999  # Return large distance if geocoding fails
                coords1 = (loc1.latitude, loc1.longitude)
            
            if isinstance(address2, tuple):
                coords2 = address2
            else:
                loc2 = geolocator.geocode(address2)
                if not loc2:
                    return 999
                coords2 = (loc2.latitude, loc2.longitude)
            
            return geodesic(coords1, coords2).kilometers
            
        except Exception as e:
            logger.error(f"Distance calculation error: {e}")
            return 999  # Return large distance if calculation fails
    
    @staticmethod
    def get_volunteer_location(volunteer_user):
        """Get volunteer location from various possible sources"""
        # Try different location sources in order of preference
        
        # 1. Check if user has address field
        if hasattr(volunteer_user, 'address') and volunteer_user.address:
            return volunteer_user.address
        
        # 2. Check volunteer profile for emergency contact or location info
        try:
            profile = volunteer_user.volunteer_profile
            if hasattr(profile, 'location') and profile.location:
                return profile.location
            if hasattr(profile, 'emergency_contact') and profile.emergency_contact:
                # Parse location from emergency contact if it contains address
                return profile.emergency_contact
        except:
            pass
        
        # 3. Use a default city location for demo purposes
        # In production, you'd require volunteers to set their location
        return "Kuala Lumpur, Malaysia" # Fallback location
    
    @staticmethod
    def find_nearby_volunteers(report, max_distance_km=15, limit=10):
        """Find volunteers within distance who can respond to rescue"""
        urgency = getattr(report, 'urgency_level', 'NORMAL')
        report_location = (report.latitude, report.longitude)
        
        # Base query for available volunteers
        base_query = VolunteerProfile.objects.filter(
            has_animal_handling=True,
            user__is_active=True,
            gps_tracking_consent=True
        ).select_related('user')
        
        # Filter by emergency availability for urgent cases
        if urgency in ['HIGH', 'EMERGENCY']:
            base_query = base_query.filter(available_for_emergency=True)
        
        # Filter by rescue distance preference
        base_query = base_query.filter(max_rescue_distance_km__gte=max_distance_km)
        
        # Exclude volunteers already assigned to this report
        base_query = base_query.exclude(
            user__rescue_assignments__report=report,
            user__rescue_assignments__status__in=['ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ON_SCENE']
        )
        
        suitable_volunteers = []
        for volunteer in base_query:
            try:
                # Get volunteer location
                volunteer_location = RescueVolunteerService.get_volunteer_location(volunteer.user)
                
                if volunteer_location:
                    distance = RescueVolunteerService.calculate_distance(
                        volunteer_location,
                        report_location
                    )
                else:
                    # If no location available, assume they're far away
                    distance = 999
                
                # Check if within preferred distance
                if distance <= volunteer.max_rescue_distance_km:
                    # Additional availability check
                    if volunteer.is_available_for_rescue(urgency, distance):
                        suitable_volunteers.append((volunteer, distance))
                        
            except Exception as e:
                logger.error(f"Error processing volunteer {volunteer.user.username}: {e}")
                continue
        
        # Sort by multiple criteria:
        # 1. Experience level (expert first)
        # 2. Emergency availability (for urgent cases)
        # 3. Distance (closest first)
        # 4. Response time history (faster responders first)
        def sort_key(volunteer_distance_tuple):
            volunteer, distance = volunteer_distance_tuple
            
            # Experience level weight
            experience_weights = {
                'EXPERT': 4,
                'EXPERIENCED': 3,
                'INTERMEDIATE': 2,
                'BEGINNER': 1,
                'NONE': 0
            }
            experience_score = experience_weights.get(volunteer.rescue_experience_level, 0)
            
            # Emergency availability bonus for urgent cases
            emergency_bonus = 10 if (urgency in ['HIGH', 'EMERGENCY'] and volunteer.available_for_emergency) else 0
            
            # Transportation bonus
            transport_bonus = 5 if volunteer.has_transportation else 0
            
            # Response time bonus (lower is better, so invert)
            response_time_bonus = 0
            if volunteer.average_response_time_minutes:
                response_time_bonus = max(0, 30 - volunteer.average_response_time_minutes) / 30 * 5
            
            # Calculate total score (higher is better)
            total_score = experience_score + emergency_bonus + transport_bonus + response_time_bonus
            
            # Return tuple for sorting (higher score first, then closer distance)
            return (-total_score, distance)
        
        suitable_volunteers.sort(key=sort_key)
        return suitable_volunteers[:limit]
    
    @staticmethod
    def assign_volunteers_to_rescue(report, assignment_types=None):
        """Automatically assign volunteers to a new rescue report"""
        if assignment_types is None:
            assignment_types = ['PRIMARY']
        
        urgency = getattr(report, 'urgency_level', 'NORMAL')
        
        # Determine how many volunteers to assign based on urgency
        max_volunteers = 3 if urgency in ['HIGH', 'EMERGENCY'] else 2
        
        nearby_volunteers = RescueVolunteerService.find_nearby_volunteers(
            report, 
            max_distance_km=15,
            limit=max_volunteers
        )
        
        if not nearby_volunteers:
            logger.warning(f"No suitable volunteers found for report {report.id}")
            return []
        
        assignments_created = []
        
        for i, (volunteer_profile, distance) in enumerate(nearby_volunteers):
            # Determine assignment type
            if i == 0:
                assignment_type = 'PRIMARY'
            elif volunteer_profile.has_transportation:
                assignment_type = 'TRANSPORT'
            else:
                assignment_type = 'BACKUP'
            
            try:
                # Create rescue assignment
                assignment = RescueVolunteerAssignment.objects.create(
                    volunteer=volunteer_profile.user,
                    report=report,
                    assignment_type=assignment_type,
                    travel_distance_km=distance
                )
                
                # Send notification
                RescueVolunteerService.send_rescue_notification(
                    volunteer_profile.user,
                    assignment,
                    distance,
                    urgency
                )
                
                assignments_created.append(assignment)
                logger.info(f"Assigned volunteer {volunteer_profile.user.username} to rescue {report.id}")
                
            except Exception as e:
                logger.error(f"Error creating assignment for {volunteer_profile.user.username}: {e}")
                continue
        
        return assignments_created
    
    @staticmethod
    def send_rescue_notification(volunteer_user, assignment, distance, urgency):
        """Send rescue notification to volunteer"""
        try:
            from notifications.services import create_notification
            
            # Determine notification priority and message
            if urgency in ['HIGH', 'EMERGENCY']:
                priority = 'HIGH'
                title = f'🚨 URGENT: {assignment.report.animal_type} Rescue Needed'
                message = f'URGENT rescue needed {distance:.1f}km away. Immediate response required!'
            else:
                priority = 'NORMAL'
                title = f'🐕 Rescue Assignment: {assignment.report.animal_type}'
                message = f'A {assignment.report.animal_type} needs rescue {distance:.1f}km away. Can you help?'
            
            # Add location details
            message += f'\nLocation: {assignment.report.location}'
            if hasattr(assignment.report, 'description') and assignment.report.description:
                message += f'\nDetails: {assignment.report.description[:100]}'
            
            create_notification(
                recipient=volunteer_user,
                notification_type='RESCUE_ASSIGNMENT',
                title=title,
                message=message,
                related_object=assignment,
                priority=priority
            )
            
            # Send additional alerts for emergency cases
            if urgency == 'EMERGENCY':
                RescueVolunteerService.send_emergency_alert(volunteer_user, assignment)
                
        except ImportError:
            logger.warning("Notification service not available")
        except Exception as e:
            logger.error(f"Error sending notification to {volunteer_user.username}: {e}")
    
    @staticmethod
    def send_emergency_alert(volunteer_user, assignment):
        """Send additional emergency alert (SMS, call, etc.)"""
        try:
            volunteer_profile = volunteer_user.volunteer_profile
            
            # Check preferred contact method
            if volunteer_profile.preferred_contact_method == 'SMS':
                RescueVolunteerService.send_sms_alert(volunteer_user, assignment)
            elif volunteer_profile.preferred_contact_method == 'CALL':
                RescueVolunteerService.send_call_alert(volunteer_user, assignment)
            # Email and APP notifications already handled by main notification system
            
        except Exception as e:
            logger.error(f"Error sending emergency alert to {volunteer_user.username}: {e}")
    
    @staticmethod
    def send_sms_alert(volunteer_user, assignment):
        """Send SMS alert for emergency rescues"""
        # Placeholder for SMS integration
        # You would integrate with services like Twilio, AWS SNS, etc.
        logger.info(f"SMS alert would be sent to {volunteer_user.username}")
        pass
    
    @staticmethod
    def send_call_alert(volunteer_user, assignment):
        """Send automated call alert for emergency rescues"""
        # Placeholder for automated calling system
        # You would integrate with services like Twilio Voice, etc.
        logger.info(f"Call alert would be sent to {volunteer_user.username}")
        pass
    
    @staticmethod
    def get_available_rescues_for_volunteer(volunteer_user):
        """Get available rescue assignments for a specific volunteer"""
        try:
            volunteer_profile = volunteer_user.volunteer_profile
        except VolunteerProfile.DoesNotExist:
            logger.warning(f"No volunteer profile found for user {volunteer_user.username}")
            return []
        
        # Import here to avoid circular imports
        from reports.models import Report
        
        # Find unassigned reports that need volunteers
        available_reports = Report.objects.filter(
            status__in=['PENDING', 'INVESTIGATING'],  # Updated to match your Report model
        ).exclude(
            # Exclude reports where volunteer is already assigned
            volunteer_assignments__volunteer=volunteer_user
        )
        
        # Add urgency filter if available
        if hasattr(Report, 'urgency_level'):
            available_reports = available_reports.filter(
                urgency_level__in=['NORMAL', 'HIGH', 'EMERGENCY']
            )
        
        available_rescues = []
        for report in available_reports:
            try:
                # Check if volunteer can handle this rescue
                urgency = getattr(report, 'urgency_level', 'NORMAL')
                
                # Get volunteer location
                volunteer_location = RescueVolunteerService.get_volunteer_location(volunteer_user)
                
                if volunteer_location:
                    distance = RescueVolunteerService.calculate_distance(
                        volunteer_location,
                        (report.latitude, report.longitude)
                    )
                else:
                    # Default distance if no location
                    distance = 5.0  # Assume 5km for demo
                
                if volunteer_profile.is_available_for_rescue(urgency, distance):
                    # Get animal type from related animal or default
                    animal_type = 'Animal'
                    if hasattr(report, 'animal') and report.animal:
                        animal_type = report.animal.animal_type
                    elif hasattr(report, 'animal_type'):
                        animal_type = report.animal_type
                    
                    # Get location string
                    location = 'Unknown Location'
                    if hasattr(report, 'location_details') and report.location_details:
                        location = report.location_details
                    elif hasattr(report, 'location') and report.location:
                        location = str(report.location)
                    
                    available_rescues.append({
                        'report_id': report.id,
                        'animal_type': animal_type,
                        'location': location,
                        'urgency': urgency,
                        'distance_km': round(distance, 1),
                        'description': report.description or 'No description available',
                        'created_at': report.created_at,
                        'latitude': report.latitude,
                        'longitude': report.longitude,
                        'estimated_response_time': int(distance * 3)  # Rough estimate: 3 min per km
                    })
                    
            except Exception as e:
                logger.error(f"Error processing report {report.id} for volunteer {volunteer_user.username}: {e}")
                continue
        
        # Sort by urgency then distance
        def sort_key(rescue):
            urgency_weights = {'EMERGENCY': 0, 'HIGH': 1, 'NORMAL': 2, 'LOW': 3}
            return (urgency_weights.get(rescue['urgency'], 2), rescue['distance_km'])
        
        available_rescues.sort(key=sort_key)
        return available_rescues
    
    @staticmethod
    def update_assignment_status(assignment, new_status, notes=None):
        """Update rescue assignment status with logging"""
        old_status = assignment.status
        assignment.status = new_status
        
        if notes:
            assignment.volunteer_notes = notes
        
        # Set timestamps based on status
        if new_status == 'ACCEPTED' and not assignment.accepted_at:
            assignment.accepted_at = timezone.now()
            assignment.calculate_response_time()
        elif new_status == 'COMPLETED' and not assignment.completed_at:
            assignment.completed_at = timezone.now()
        
        assignment.save()
        
        logger.info(f"Assignment {assignment.id} status changed from {old_status} to {new_status}")
        
        # Send status update notifications
        try:
            from notifications.services import create_notification
            
            # Notify report creator
            if hasattr(assignment.report, 'reporter') and assignment.report.reporter:
                status_messages = {
                    'ACCEPTED': f"Volunteer {assignment.volunteer.username} is responding to your {assignment.report.animal_type if hasattr(assignment.report, 'animal_type') else 'animal'} report!",
                    'EN_ROUTE': f"Volunteer is on the way to help with your animal report.",
                    'ON_SCENE': f"Volunteer has arrived at the scene of your animal report.",
                    'COMPLETED': f"Rescue completed! Your animal report has been resolved.",
                    'CANCELLED': f"Volunteer response to your animal report has been cancelled."
                }
                
                message = status_messages.get(new_status, f"Status update: {new_status}")
                
                create_notification(
                    recipient=assignment.report.reporter,
                    notification_type='RESCUE_UPDATE',
                    title=f'Rescue Update',
                    message=message,
                    related_object=assignment
                )
                
        except Exception as e:
            logger.error(f"Error sending status update notification: {e}")
    
    @staticmethod
    def calculate_volunteer_stats(volunteer_user):
        """Calculate comprehensive volunteer statistics"""
        try:
            volunteer_profile = volunteer_user.volunteer_profile
            
            # Get rescue assignments
            rescue_assignments = volunteer_user.rescue_assignments.all()
            completed_rescues = rescue_assignments.filter(status='COMPLETED')
            
            # Get regular volunteer assignments
            volunteer_assignments = volunteer_user.volunteer_assignments.all()
            completed_volunteer_work = volunteer_assignments.filter(status='COMPLETED')
            
            # Calculate stats
            stats = {
                'total_volunteer_hours': volunteer_profile.total_hours,
                'total_rescues_completed': completed_rescues.count(),
                'average_response_time': volunteer_profile.average_response_time_minutes or 0,
                'points_earned': getattr(volunteer_user, 'points', 0),
                'certifications_count': volunteer_profile.certifications.filter(is_active=True).count(),
                'current_assignments': rescue_assignments.filter(
                    status__in=['ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ON_SCENE']
                ).count(),
                'volunteer_rank': RescueVolunteerService.calculate_volunteer_rank(volunteer_profile),
                'achievements_count': getattr(volunteer_user, 'achievements', []).count() if hasattr(volunteer_user, 'achievements') else 0
            }
            
            return stats
            
        except VolunteerProfile.DoesNotExist:
            return {
                'total_volunteer_hours': 0,
                'total_rescues_completed': 0,
                'average_response_time': 0,
                'points_earned': 0,
                'certifications_count': 0,
                'current_assignments': 0,
                'volunteer_rank': 'Newcomer',
                'achievements_count': 0
            }
    
    @staticmethod
    def calculate_volunteer_rank(volunteer_profile):
        """Calculate volunteer rank based on experience and contributions"""
        total_rescues = volunteer_profile.total_rescues_completed
        total_hours = volunteer_profile.total_hours
        certifications = volunteer_profile.certifications.filter(is_active=True).count()
        
        # Calculate rank based on multiple factors
        score = total_rescues * 3 + total_hours * 0.5 + certifications * 5
        
        if score >= 100:
            return 'Expert Rescuer'
        elif score >= 50:
            return 'Experienced Volunteer'
        elif score >= 20:
            return 'Active Volunteer'
        elif score >= 5:
            return 'Contributing Member'
        else:
            return 'Newcomer'


    # ADD THIS METHOD to your existing volunteers/services.py

    @staticmethod
    def format_reports_for_frontend(reports, volunteer_user=None):
        """Format reports for frontend rescue display"""
        formatted_rescues = []
    
        volunteer_location = None
        if volunteer_user:
            volunteer_location = RescueVolunteerService.get_volunteer_location(volunteer_user)
    
        for report in reports:
            try:
                # Calculate distance if volunteer location available
                distance_km = None
                if volunteer_location and hasattr(report, 'latitude') and report.latitude:
                    distance_km = RescueVolunteerService.calculate_distance(
                        volunteer_location,
                        (report.latitude, report.longitude)
                    )
            
                # Determine animal type
                animal_type = 'Unknown Animal'
                if hasattr(report, 'animal') and report.animal:
                    animal_type = f"{report.animal.breed or report.animal.animal_type or 'Animal'}"
                elif hasattr(report, 'animal_type'):
                    animal_type = report.animal_type
            
                # Format location
                location = None
                if hasattr(report, 'location') and report.location:
                    location = report.location
                elif hasattr(report, 'latitude') and report.latitude:
                    location = {
                        'lat': report.latitude,
                        'lng': report.longitude
                    }
            
                # Calculate time since reported
                time_since = 'Unknown'
                if hasattr(report, 'created_at'):
                    from django.utils import timezone
                    time_diff = timezone.now() - report.created_at
                    hours = int(time_diff.total_seconds() // 3600)
                    minutes = int((time_diff.total_seconds() % 3600) // 60)
                
                    if hours > 0:
                        time_since = f"{hours}h {minutes}m ago"
                    else:
                        time_since = f"{minutes}m ago"
            
                formatted_rescue = {
                    'id': report.id,
                    'type': 'rescue',
                    'animal_type': animal_type,
                    'urgency': getattr(report, 'urgency_level', 'NORMAL'),
                    'location': location,
                    'location_details': getattr(report, 'location_details', ''),
                    'description': getattr(report, 'description', ''),
                    'animal_condition': getattr(report, 'animal_condition', '') or getattr(report, 'animal_condition_choice', ''),
                    'created_at': report.created_at.isoformat() if hasattr(report, 'created_at') else None,
                    'time_since_reported': time_since,
                    'distance_km': round(distance_km, 1) if distance_km else None,
                    'photos': getattr(report, 'photos', []),
                    'status': getattr(report, 'status', 'PENDING'),
                    'reporter_contact': getattr(report.reporter, 'phone', '') if hasattr(report, 'reporter') and report.reporter else ''
                }
            
                formatted_rescues.append(formatted_rescue)
            
            except Exception as e:
                logger.error(f"Error formatting report {report.id}: {e}")
                continue
    
        # Sort by urgency then time (most urgent and recent first)
        def sort_key(rescue):
            urgency_weights = {'EMERGENCY': 0, 'HIGH': 1, 'NORMAL': 2, 'LOW': 3}
            return (urgency_weights.get(rescue['urgency'], 2), rescue['created_at'] or '')
    
        formatted_rescues.sort(key=sort_key)
        return formatted_rescues
