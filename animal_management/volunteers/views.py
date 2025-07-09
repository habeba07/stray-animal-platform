# COMPLETE volunteers/views.py - Replace your entire file with this

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import (
    VolunteerProfile, VolunteerOpportunity, VolunteerAssignment,
    RescueVolunteerAssignment, VolunteerTrainingProgress, VolunteerSkillCertification
)

from community.services import (
    track_rescue_assignment_accepted,
    track_rescue_assignment_completed,
    track_training_started,
    track_training_completed,
    track_quiz_passed,
    get_user_activity_stats
)

from .serializers import (
    VolunteerProfileSerializer, VolunteerOpportunitySerializer, VolunteerAssignmentSerializer,
    RescueVolunteerAssignmentSerializer, LocationUpdateSerializer, VolunteerTrainingProgressSerializer,
    VolunteerSkillCertificationSerializer, AvailableRescueSerializer, RescueAcceptanceSerializer,
    RescueCompletionSerializer, VolunteerStatsSerializer, NearbyVolunteerSerializer
)
from .services import RescueVolunteerService
from notifications.services import create_notification
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class VolunteerProfileViewSet(viewsets.ModelViewSet):
    queryset = VolunteerProfile.objects.all()
    serializer_class = VolunteerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return VolunteerProfile.objects.all()
        return VolunteerProfile.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current user's volunteer profile"""
        try:
            profile = VolunteerProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except VolunteerProfile.DoesNotExist:
            return Response(
                {"detail": "No volunteer profile found for this user."}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def my_stats(self, request):
        """Get comprehensive volunteer statistics"""
        stats = RescueVolunteerService.calculate_volunteer_stats(request.user)
        serializer = VolunteerStatsSerializer(stats)
        return Response(serializer.data)


class VolunteerOpportunityViewSet(viewsets.ModelViewSet):
    queryset = VolunteerOpportunity.objects.all()
    serializer_class = VolunteerOpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming volunteer opportunities"""
        upcoming = VolunteerOpportunity.objects.filter(
            start_time__gt=timezone.now(),
            status='OPEN'
        ).order_by('start_time')
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recommended(self, request):
        """Get recommended opportunities based on volunteer profile"""
        try:
            volunteer_profile = request.user.volunteer_profile
        except VolunteerProfile.DoesNotExist:
            return Response({"detail": "Volunteer profile required"}, status=400)
        
        # Get all available opportunities
        opportunities = VolunteerOpportunity.objects.filter(
            start_time__gt=timezone.now(),
            status='OPEN'
        )
        
        # Filter by volunteer capabilities and preferences
        recommended = []
        for opportunity in opportunities:
            if opportunity.can_volunteer_participate(volunteer_profile):
                # Calculate match score based on interests and skills
                score = 0
                volunteer_interests = set(volunteer_profile.interests)
                volunteer_skills = set(volunteer_profile.skills)
                required_skills = set(opportunity.skills_required)
                
                # Interest matching
                if opportunity.category in volunteer_interests:
                    score += 3
                
                # Skill matching
                skill_match = len(volunteer_skills.intersection(required_skills))
                score += skill_match * 2
                
                # Experience level matching
                experience_levels = ['BEGINNER', 'INTERMEDIATE', 'EXPERIENCED', 'PROFESSIONAL']
                if experience_levels.index(volunteer_profile.experience_level) >= experience_levels.index(opportunity.minimum_experience):
                    score += 1
                
                recommended.append((opportunity, score))
        
        # Sort by score (highest first) and limit to top 10
        recommended.sort(key=lambda x: x[1], reverse=True)
        top_opportunities = [opp for opp, score in recommended[:10]]
        
        serializer = self.get_serializer(top_opportunities, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def volunteer(self, request, pk=None):
        """Volunteer for an opportunity"""
        opportunity = self.get_object()
        
        if opportunity.status != 'OPEN':
            return Response(
                {"detail": "This opportunity is not open for volunteers."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if opportunity.assignments.count() >= opportunity.max_volunteers:
            return Response(
                {"detail": "This opportunity is already full."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already volunteered
        if VolunteerAssignment.objects.filter(volunteer=request.user, opportunity=opportunity).exists():
            return Response(
                {"detail": "You've already volunteered for this opportunity."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if volunteer meets requirements
        try:
            volunteer_profile = request.user.volunteer_profile
            if not opportunity.can_volunteer_participate(volunteer_profile):
                return Response(
                    {"detail": "You don't meet the requirements for this opportunity."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except VolunteerProfile.DoesNotExist:
            return Response(
                {"detail": "Volunteer profile required to sign up."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create volunteer assignment
        assignment = VolunteerAssignment.objects.create(
            volunteer=request.user,
            opportunity=opportunity
        )
        
        # Check if opportunity is now full
        if opportunity.assignments.count() >= opportunity.max_volunteers:
            opportunity.status = 'FILLED'
            opportunity.save()

        # Notify staff users
        staff_users = User.objects.filter(user_type__in=['STAFF', 'SHELTER'])
        for staff_user in staff_users:
            create_notification(
                recipient=staff_user,
                notification_type='VOLUNTEER_ASSIGNMENT',
                title='New Volunteer Assignment',
                message=f'{request.user.username} volunteered for: {opportunity.title}',
                related_object=assignment
            )
        
        # Create notification for the volunteer
        create_notification(
            recipient=request.user,
            notification_type='VOLUNTEER_ASSIGNMENT',
            title='Volunteer Assignment Confirmed',
            message=f'You have signed up for: {opportunity.title} on {opportunity.start_time.strftime("%B %d, %Y at %I:%M %p")}',
            related_object=assignment
        )
        
        serializer = VolunteerAssignmentSerializer(assignment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VolunteerAssignmentViewSet(viewsets.ModelViewSet):
    queryset = VolunteerAssignment.objects.all()
    serializer_class = VolunteerAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return VolunteerAssignment.objects.all()
        return VolunteerAssignment.objects.filter(volunteer=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_assignments(self, request):
        """Get current user's volunteer assignments"""
        assignments = VolunteerAssignment.objects.filter(volunteer=request.user)
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm participation in a volunteer opportunity"""
        assignment = self.get_object()
        
        if assignment.volunteer != request.user:
            return Response(
                {"detail": "You can only confirm your own assignments."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignment.status = 'CONFIRMED'
        assignment.confirmed_at = timezone.now()
        assignment.save()
        
        serializer = self.get_serializer(assignment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete a volunteer assignment and log hours"""
        assignment = self.get_object()
        
        if assignment.volunteer != request.user:
            return Response(
                {"detail": "You can only complete your own assignments."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        hours = request.data.get('hours')
        if not hours:
            return Response(
                {"detail": "Hours worked is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            hours = float(hours)
            assignment.complete_assignment(hours)
            
            serializer = self.get_serializer(assignment)
            return Response(serializer.data)
            
        except ValueError:
            return Response(
                {"detail": "Invalid hours value."},
                status=status.HTTP_400_BAD_REQUEST
            )


class RescueVolunteerAssignmentViewSet(viewsets.ModelViewSet):
    queryset = RescueVolunteerAssignment.objects.all()
    serializer_class = RescueVolunteerAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Volunteers only see their own rescue assignments"""
        if self.request.user.is_staff:
            return RescueVolunteerAssignment.objects.all()
        return RescueVolunteerAssignment.objects.filter(volunteer=self.request.user)
    
    # 🔧 FIXED: Enhanced available_rescues method
    @action(detail=False, methods=['get'])
    def available_rescues(self, request):
        """Get rescue assignments available for volunteer - FIXED to handle direct animal_type"""
        try:
            volunteer_profile = VolunteerProfile.objects.get(user=request.user)
        except VolunteerProfile.DoesNotExist:
            return Response({"detail": "Volunteer profile required"}, status=400)

        # Import here to avoid circular imports
        from reports.models import Report
        from django.utils import timezone

        # Get reports that need volunteers - DIRECT DATABASE QUERY
        available_reports = Report.objects.filter(
            status__in=['PENDING', 'INVESTIGATING', 'ASSIGNED']
        ).exclude(
            # Exclude reports where volunteer is already assigned
            volunteer_assignments__volunteer=request.user
        ).select_related('animal').order_by('-urgency_level', '-created_at')

        available_rescues = []

        for report in available_reports:
            try:
                # 🔧 FIXED: Enhanced animal type detection with multiple fallbacks
                animal_type = 'Unknown Animal'
                
                # Method 1: Check direct animal_type field (for emergency reports)
                if hasattr(report, 'animal_type') and report.animal_type:
                    # Handle both "DOG" format and "Dog" format
                    animal_type_clean = report.animal_type.replace('_', ' ').title()
                    animal_type = f"{animal_type_clean} Rescue"
                
                # Method 2: Check linked Animal object
                elif hasattr(report, 'animal') and report.animal and hasattr(report.animal, 'animal_type'):
                    animal_type = f"{report.animal.animal_type.title()} Rescue"
                
                # Method 3: Check linked animal breed
                elif hasattr(report, 'animal') and report.animal and hasattr(report.animal, 'breed'):
                    breed_lower = report.animal.breed.lower()
                    if any(dog_word in breed_lower for dog_word in ['dog', 'terrier', 'retriever', 'bulldog', 'shepherd']):
                        animal_type = 'Dog Rescue'
                    elif any(cat_word in breed_lower for cat_word in ['cat', 'persian', 'siamese', 'tabby']):
                        animal_type = 'Cat Rescue'
                    else:
                        animal_type = f"{report.animal.breed.title()} Rescue"
                
                # Method 4: Analyze description for animal type keywords
                elif report.description:
                    desc_lower = report.description.lower()
                    if any(word in desc_lower for word in ['dog', 'puppy', 'canine', 'pup']):
                        animal_type = 'Dog Rescue'
                    elif any(word in desc_lower for word in ['cat', 'kitten', 'feline', 'kitty']):
                        animal_type = 'Cat Rescue'
                    elif any(word in desc_lower for word in ['bird', 'chicken', 'duck', 'pigeon']):
                        animal_type = 'Bird Rescue'
                    elif any(word in desc_lower for word in ['rabbit', 'bunny']):
                        animal_type = 'Rabbit Rescue'

                # 🔧 FIXED: Enhanced urgency detection
                urgency = 'NORMAL'
                if hasattr(report, 'urgency_level') and report.urgency_level:
                    urgency = report.urgency_level
                else:
                    # Fallback: detect urgency from description/condition
                    urgency = self.calculate_report_urgency(report)

                # 🔧 FIXED: Better location handling
                location_display = 'Location not specified'
                coordinates = None
                
                if hasattr(report, 'location_details') and report.location_details:
                    location_display = report.location_details
                    
                if hasattr(report, 'latitude') and report.latitude:
                    coordinates = {
                        'lat': float(report.latitude),
                        'lng': float(report.longitude)
                    }
                    if not report.location_details:
                        location_display = f"{round(report.latitude, 4)}, {round(report.longitude, 4)}"
                elif hasattr(report, 'geo_location') and report.geo_location:
                    coordinates = {
                        'lat': report.geo_location.y,
                        'lng': report.geo_location.x
                    }
                    if not report.location_details:
                        location_display = f"{round(report.geo_location.y, 4)}, {round(report.geo_location.x, 4)}"

                # 🔧 FIXED: Enhanced condition detection
                condition_display = self.detect_animal_condition(report)

                # 🔧 FIXED: Better time calculation
                time_since = self.calculate_time_since(report.created_at)

                rescue_data = {
                    'id': report.id,
                    'type': 'rescue',
                    'animal_type': animal_type,  # Now properly detects "Dog Rescue", "Cat Rescue", etc.
                    'urgency': urgency,
                    'location': coordinates or location_display,
                    'location_details': getattr(report, 'location_details', ''),
                    'description': report.description or 'No description available',
                    'animal_condition': condition_display,
                    'created_at': report.created_at.isoformat(),
                    'time_since_reported': time_since,
                    'distance_km': None,  # Will be calculated by frontend if needed
                    'photos': getattr(report, 'photos', []),
                    'status': report.status,
                    'reporter_contact': getattr(report.reporter, 'phone', '') if hasattr(report, 'reporter') and report.reporter else ''
                }

                available_rescues.append(rescue_data)

            except Exception as e:
                print(f"Error processing report {report.id}: {e}")
                continue

        # 🔧 FIXED: Proper sorting by urgency and recency
        def sort_key(rescue):
            urgency_weights = {'EMERGENCY': 0, 'HIGH': 1, 'NORMAL': 2, 'LOW': 3}
            return (urgency_weights.get(rescue['urgency'], 2), -rescue['id'])

        available_rescues.sort(key=sort_key)

        return Response(available_rescues)

    def calculate_report_urgency(self, report):
        """Enhanced urgency calculation"""
        # Check structured condition field first
        if hasattr(report, 'animal_condition_choice') and report.animal_condition_choice:
            emergency_conditions = ['INJURED', 'SICK']
            if report.animal_condition_choice in emergency_conditions:
                return 'EMERGENCY'
            
            high_priority_conditions = ['AGGRESSIVE', 'PREGNANT', 'WITH_BABIES']
            if report.animal_condition_choice in high_priority_conditions:
                return 'HIGH'
        
        # Enhanced text analysis
        text_to_check = []
        if hasattr(report, 'description') and report.description:
            text_to_check.append(report.description.lower())
        if hasattr(report, 'animal_condition') and report.animal_condition:
            text_to_check.append(report.animal_condition.lower())
        
        combined_text = ' '.join(text_to_check)
        
        # Emergency keywords
        emergency_keywords = [
            'injured', 'bleeding', 'blood', 'hit by car', 'accident', 'emergency', 
            'urgent', 'dying', 'trapped', 'stuck', 'broken', 'limping', 'wound',
            'cut', 'bite', 'attack', 'unconscious', 'collapse', 'can\'t move',
            'help immediately', 'critical', 'severe'
        ]
        
        # High priority keywords  
        high_priority_keywords = [
            'aggressive', 'attacking', 'biting', 'rabid', 'dangerous',
            'pregnant', 'giving birth', 'babies', 'puppies', 'kittens', 'newborn',
            'mother with', 'scared', 'terrified', 'hiding', 'won\'t come out',
            'multiple animals', 'pack', 'group'
        ]
        
        if any(keyword in combined_text for keyword in emergency_keywords):
            return 'EMERGENCY'
        
        if any(keyword in combined_text for keyword in high_priority_keywords):
            return 'HIGH'
        
        return 'NORMAL'

    def detect_animal_condition(self, report):
        """Enhanced animal condition detection"""
        # Check structured condition first
        if hasattr(report, 'animal_condition_choice') and report.animal_condition_choice:
            condition_map = {
                'HEALTHY': 'Appears healthy',
                'INJURED': 'Injured - needs immediate help',
                'SICK': 'Appears sick',
                'AGGRESSIVE': 'Aggressive - approach with caution',
                'SCARED': 'Scared and hiding',
                'PREGNANT': 'Pregnant',
                'WITH_BABIES': 'With babies/offspring',
                'UNKNOWN': 'Condition unknown'
            }
            return condition_map.get(report.animal_condition_choice, report.animal_condition_choice)

        # Check text condition field
        if hasattr(report, 'animal_condition') and report.animal_condition:
            return report.animal_condition
        
        # Analyze description for condition keywords
        if hasattr(report, 'description') and report.description:
            description_lower = report.description.lower()
            
            if any(word in description_lower for word in ['injured', 'bleeding', 'limping', 'hurt']):
                return 'Injured - needs immediate help'
            elif any(word in description_lower for word in ['sick', 'ill', 'weak', 'lethargic']):
                return 'Appears sick'
            elif any(word in description_lower for word in ['aggressive', 'attacking', 'biting', 'dangerous']):
                return 'Aggressive - approach with caution'
            elif any(word in description_lower for word in ['scared', 'hiding', 'terrified', 'won\'t come']):
                return 'Scared and hiding'
            elif any(word in description_lower for word in ['pregnant', 'babies', 'puppies', 'kittens']):
                return 'Pregnant or with offspring'
            elif any(word in description_lower for word in ['healthy', 'well', 'good', 'friendly']):
                return 'Appears healthy'
        
        return 'Condition unknown'

    def calculate_time_since(self, created_at):
        """Calculate user-friendly time since report was created"""
        from django.utils import timezone
        
        if not created_at:
            return 'Unknown time'
        
        time_diff = timezone.now() - created_at
        total_seconds = int(time_diff.total_seconds())
        
        if total_seconds < 60:
            return f"{total_seconds}s ago"
        elif total_seconds < 3600:  # Less than 1 hour
            minutes = total_seconds // 60
            return f"{minutes}m ago"
        elif total_seconds < 86400:  # Less than 1 day
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            return f"{hours}h {minutes}m ago"
        else:  # 1 day or more
            days = total_seconds // 86400
            hours = (total_seconds % 86400) // 3600
            return f"{days}d {hours}h ago"
    
    @action(detail=False, methods=['post'])
    def accept_rescue(self, request):
        """Accept a rescue assignment for a specific report"""
        report_id = request.data.get('report_id')
        if not report_id:
            return Response({"detail": "report_id is required"}, status=400)

        try:
            from reports.models import Report
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            return Response({"detail": "Report not found"}, status=404)

        # Check if user already has assignment for this report
        if RescueVolunteerAssignment.objects.filter(volunteer=request.user, report=report).exists():
            return Response({"detail": "You're already assigned to this rescue"}, status=400)
        
        existing_assignments = RescueVolunteerAssignment.objects.filter(
            report=report,
            status__in=['ACCEPTED', 'IN_PROGRESS']
        ).exclude(volunteer=request.user)

        if existing_assignments.exists():
            existing_volunteer = existing_assignments.first().volunteer.username
            return Response({
                "detail": f"This rescue is already assigned to {existing_volunteer}. Contact coordinator if backup support is needed."
            }, status=400)


        serializer = RescueAcceptanceSerializer(data=request.data)

        if serializer.is_valid():
            # Create rescue assignment
            assignment = RescueVolunteerAssignment.objects.create(
                volunteer=request.user,
                report=report,
                assignment_type=serializer.validated_data.get('assignment_type', 'PRIMARY'),
                estimated_arrival=serializer.validated_data.get('estimated_arrival'),
                volunteer_notes=serializer.validated_data.get('volunteer_notes', '')
            )
        
            # Mark as accepted immediately
            assignment.status = 'ACCEPTED'
            assignment.accepted_at = timezone.now()
            assignment.calculate_response_time()
            assignment.save()
        
            # Update report status
            report.status = 'ASSIGNED'
            report.save()
        
            # 🎯 INTEGRATION: Track rescue acceptance and award points
            try:
                track_rescue_assignment_accepted(assignment)
            except Exception as e:
                logger.error(f"Error tracking rescue acceptance: {e}")


        animal_type = report.animal_type
        if animal_type == 'None' or animal_type is None:
            desc = (report.description or '').lower()
            if 'dog' in desc:
                animal_type = 'Dog'
            elif 'cat' in desc:
                animal_type = 'Cat'
            else:
                animal_type = 'Animal'


        if report.reporter:
            # Notify report creator and staff
            create_notification(
                recipient=report.reporter,
                notification_type='RESCUE_UPDATE',
                title='Volunteer Responding! 🚑',
                message=f'{request.user.username} is responding to your {report.animal_type} report.',
                related_object=assignment
            )
        
            # Notify staff users
            staff_users = User.objects.filter(user_type__in=['STAFF', 'SHELTER'])
            for staff_user in staff_users:
                create_notification(
                    recipient=staff_user,
                    notification_type='RESCUE_UPDATE',
                    title='Rescue Assignment Accepted',
                    message=f'{request.user.username} accepted {animal_type} rescue in {getattr(report, "location_details", "unknown location")}',
                    related_object=assignment
                )
        
            response_serializer = RescueVolunteerAssignmentSerializer(assignment)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=400)

    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update rescue assignment status"""
        assignment = self.get_object()
        
        if assignment.volunteer != request.user:
            return Response({"detail": "Not your assignment"}, status=403)
        
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if new_status not in dict(RescueVolunteerAssignment.STATUS_CHOICES):
            return Response({"detail": "Invalid status"}, status=400)
        
        RescueVolunteerService.update_assignment_status(assignment, new_status, notes)
        
        serializer = self.get_serializer(assignment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_location(self, request, pk=None):
        """Update volunteer's current location during rescue"""
        assignment = self.get_object()
        
        if assignment.volunteer != request.user:
            return Response({"detail": "Not your assignment"}, status=403)
        
        serializer = LocationUpdateSerializer(data=request.data)
        if serializer.is_valid():
            latitude = serializer.validated_data['latitude']
            longitude = serializer.validated_data['longitude']
            
            assignment.update_location(latitude, longitude)
            
            return Response({"detail": "Location updated successfully"})
        
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['post'])
    def complete_rescue(self, request, pk=None):
        """Mark rescue as completed"""
        import logging
        logger = logging.getLogger(__name__)

        assignment = self.get_object()

        if assignment.volunteer != request.user:
            return Response({"detail": "Not your assignment"}, status=403)

        serializer = RescueCompletionSerializer(data=request.data)
        if serializer.is_valid():
            completion_notes = serializer.validated_data.get('completion_notes', '')
            rescue_outcome = serializer.validated_data.get('rescue_outcome', 'SUCCESS')
        
            logger.info(f"DEBUG: About to call mark_completed for assignment {assignment.id}")
            assignment.mark_completed(completion_notes)
            logger.info(f"DEBUG: Finished mark_completed for assignment {assignment.id}")
        
            # Update report status based on outcome
            if rescue_outcome == 'SUCCESS':
                assignment.report.status = 'RESCUED'
            elif rescue_outcome == 'REFERRED':
                assignment.report.status = 'INVESTIGATING'
            else:
                assignment.report.status = 'CLOSED'
        
            assignment.report.save()
        
            
            # Update volunteer profile stats
            if hasattr(request.user, 'volunteer_profile'):
                volunteer_profile = request.user.volunteer_profile
                volunteer_profile.update_rescue_stats()
                

            animal_type = assignment.report.animal_type
            if animal_type == 'None' or animal_type is None:
                desc = (assignment.report.description or '').lower()
                if 'dog' in desc:
                    animal_type = 'Dog'
                elif 'cat' in desc:
                    animal_type = 'Cat'
                else:
                    animal_type = 'Animal'
        
            # Create completion notification
            create_notification(
                recipient=assignment.report.reporter,
                notification_type='RESCUE_UPDATE',
                title='Rescue Completed! 🎉',
                message=f'Your {animal_type} rescue has been completed by {request.user.username}.',
                related_object=assignment
            )
        
            # Notify staff
            staff_users = User.objects.filter(user_type__in=['STAFF', 'SHELTER'])
            for staff_user in staff_users:
                create_notification(
                    recipient=staff_user,
                    notification_type='RESCUE_UPDATE',
                    title='Rescue Mission Completed',
                    message=f'{request.user.username} completed {animal_type} rescue - {rescue_outcome}',
                    related_object=assignment
                )
        
            response_serializer = self.get_serializer(assignment)
            return Response(response_serializer.data)

        return Response(serializer.errors, status=400)
    
    @action(detail=False, methods=['get'])
    def my_rescue_assignments(self, request):
        """Get current user's rescue assignments"""
        assignments = RescueVolunteerAssignment.objects.filter(volunteer=request.user).order_by('-assigned_at')
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def activity_dashboard(self, request):
        """Get comprehensive volunteer activity dashboard"""

        # Get activity stats for different periods
        stats_30_days = get_user_activity_stats(request.user, days=30)
        stats_7_days = get_user_activity_stats(request.user, days=7)
        stats_today = get_user_activity_stats(request.user, days=1)

        # Get volunteer profile info
        volunteer_profile = None
        try:
            volunteer_profile = request.user.volunteer_profile
            profile_data = {
                'total_rescues_completed': volunteer_profile.total_rescues_completed,
                'average_response_time_minutes': volunteer_profile.average_response_time_minutes,
                'rescue_experience_level': volunteer_profile.rescue_experience_level,
                'available_for_emergency': volunteer_profile.available_for_emergency
            }
        except VolunteerProfile.DoesNotExist:
            profile_data = {}

        # Get recent achievements
        recent_achievements = request.user.achievements.order_by('-earned_at')[:5]
        achievement_data = [
            {
                'name': ua.achievement.name,
                'description': ua.achievement.description,
                'category': ua.achievement.category,
                'earned_at': ua.earned_at,
                'points_reward': ua.achievement.points_reward
            }
            for ua in recent_achievements
        ]

        # Get leaderboard position
        from community.services import get_leaderboard
        rescue_leaderboard = get_leaderboard('RESCUE_COMPLETED', days=30, limit=50)
        user_rank = None
        for i, entry in enumerate(rescue_leaderboard):
            if entry['user__id'] == request.user.id:
                user_rank = i + 1
                break

        return Response({
            'user_profile': profile_data,
            'total_points': request.user.points or 0,
            'stats': {
                'today': stats_today,
                'week': stats_7_days,
                'month': stats_30_days
            },
            'recent_achievements': achievement_data,
            'leaderboard_position': {
                'rescue_rank': user_rank,
                'total_participants': len(rescue_leaderboard)
            }
        })

class VolunteerTrainingProgressViewSet(viewsets.ModelViewSet):
    queryset = VolunteerTrainingProgress.objects.all()
    serializer_class = VolunteerTrainingProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return VolunteerTrainingProgress.objects.all()
        try:
            volunteer_profile = self.request.user.volunteer_profile
            return VolunteerTrainingProgress.objects.filter(volunteer=volunteer_profile)
        except VolunteerProfile.DoesNotExist:
            return VolunteerTrainingProgress.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_progress(self, request):
        """Get current user's training progress"""
        try:
            volunteer_profile = request.user.volunteer_profile
            progress = VolunteerTrainingProgress.objects.filter(volunteer=volunteer_profile)
            serializer = self.get_serializer(progress, many=True)
            return Response(serializer.data)
        except VolunteerProfile.DoesNotExist:
            return Response({"detail": "Volunteer profile required"}, status=400)
    
    @action(detail=True, methods=['post'])
    def complete_training(self, request, pk=None):
        """Mark training as completed with score"""
        progress = self.get_object()
        
        if progress.volunteer.user != request.user:
            return Response({"detail": "Not your training"}, status=403)
        
        score = request.data.get('score')
        if score is not None:
            try:
                score = int(score)
                if score < 0 or score > 100:
                    return Response({"detail": "Score must be between 0 and 100"}, status=400)
            except ValueError:
                return Response({"detail": "Invalid score value"}, status=400)
        
        progress.mark_completed(score)
        
        serializer = self.get_serializer(progress)
        return Response(serializer.data)


class VolunteerSkillCertificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VolunteerSkillCertification.objects.all()
    serializer_class = VolunteerSkillCertificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return VolunteerSkillCertification.objects.all()
        try:
            volunteer_profile = self.request.user.volunteer_profile
            return VolunteerSkillCertification.objects.filter(volunteer=volunteer_profile)
        except VolunteerProfile.DoesNotExist:
            return VolunteerSkillCertification.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_certifications(self, request):
        """Get current user's certifications"""
        try:
            volunteer_profile = request.user.volunteer_profile
            certifications = VolunteerSkillCertification.objects.filter(
                volunteer=volunteer_profile,
                is_active=True
            )
            serializer = self.get_serializer(certifications, many=True)
            return Response(serializer.data)
        except VolunteerProfile.DoesNotExist:
            return Response({"detail": "Volunteer profile required"}, status=400)


# Staff/Admin only views
class VolunteerManagementViewSet(viewsets.ViewSet):
    """Staff/Admin views for managing volunteers"""
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def nearby_volunteers(self, request):
        """Find volunteers near a specific location (for staff use)"""
        latitude = request.query_params.get('latitude')
        longitude = request.query_params.get('longitude')
        max_distance = request.query_params.get('max_distance', 15)
        
        if not latitude or not longitude:
            return Response({"detail": "Latitude and longitude required"}, status=400)
        
        try:
            # Create a mock report object for distance calculation
            class MockReport:
                latitude = float(latitude)
                longitude = float(longitude)
                urgency_level = request.query_params.get('urgency', 'NORMAL')
            
            mock_report = MockReport()
            nearby_volunteers = RescueVolunteerService.find_nearby_volunteers(
                mock_report, 
                max_distance_km=float(max_distance)
            )
            
            volunteer_data = []
            for volunteer_profile, distance in nearby_volunteers:
                volunteer_data.append({
                    'volunteer_id': volunteer_profile.user.id,
                    'username': volunteer_profile.user.username,
                    'distance_km': round(distance, 1),
                    'experience_level': volunteer_profile.experience_level,
                    'rescue_experience_level': volunteer_profile.rescue_experience_level,
                    'has_transportation': volunteer_profile.has_transportation,
                    'available_for_emergency': volunteer_profile.available_for_emergency,
                    'total_rescues': volunteer_profile.total_rescues_completed,
                    'average_response_time': volunteer_profile.average_response_time_minutes,
                    'phone_number': volunteer_profile.user.phone_number,
                    'preferred_contact_method': volunteer_profile.preferred_contact_method,
                })
            
            serializer = NearbyVolunteerSerializer(volunteer_data, many=True)
            return Response(serializer.data)
            
        except ValueError:
            return Response({"detail": "Invalid coordinates"}, status=400)
    
    @action(detail=False, methods=['post'])
    def assign_rescue(self, request):
        """Manually assign volunteers to a rescue (staff use)"""
        report_id = request.data.get('report_id')
        volunteer_ids = request.data.get('volunteer_ids', [])
        
        if not report_id:
            return Response({"detail": "report_id required"}, status=400)
        
        try:
            from reports.models import Report
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            return Response({"detail": "Report not found"}, status=404)
        
        assignments_created = []
        for volunteer_id in volunteer_ids:
            try:
                volunteer = User.objects.get(id=volunteer_id)
                assignment, created = RescueVolunteerAssignment.objects.get_or_create(
                    volunteer=volunteer,
                    report=report,
                    defaults={'assignment_type': 'PRIMARY'}
                )
                if created:
                    assignments_created.append(assignment)
                    # Send notification
                    RescueVolunteerService.send_rescue_notification(
                        volunteer, assignment, 0, getattr(report, 'urgency_level', 'NORMAL')
                    )
            except User.DoesNotExist:
                continue
        
        serializer = RescueVolunteerAssignmentSerializer(assignments_created, many=True)
        return Response(serializer.data)
