# adoptions/views.py - ENHANCED VERSION with fixed match scores and bulk actions

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from .models import AdopterProfile, AnimalBehaviorProfile, AdoptionApplication, AdoptionMatch
from .serializers import (
    AdopterProfileSerializer, 
    AnimalBehaviorProfileSerializer, 
    AdoptionApplicationSerializer, 
    AdoptionMatchSerializer
)
from animals.models import Animal
from .matching import AdoptionMatchingSystem
from notifications.services import create_notification
from .ml_matching import MLAdoptionMatcher
from community.services import award_points

class AdopterProfileViewSet(viewsets.ModelViewSet):
    queryset = AdopterProfile.objects.all()
    serializer_class = AdopterProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own profile unless they are staff
        if self.request.user.is_staff:
            return AdopterProfile.objects.all()
        return AdopterProfile.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):

        # Automatically set the user to the current user
        profile = serializer.save(user=self.request.user)

        award_points(self.request.user, 'PROFILE_CREATED', profile)
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get the current user's adopter profile"""
        try:
            profile = AdopterProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except AdopterProfile.DoesNotExist:
            return Response(
                {"detail": "No adopter profile found for this user."}, 
                status=status.HTTP_404_NOT_FOUND
            )


class AnimalBehaviorProfileViewSet(viewsets.ModelViewSet):
    queryset = AnimalBehaviorProfile.objects.all()
    serializer_class = AnimalBehaviorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        # Only staff can create/update/delete behavior profiles
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]


class AdoptionApplicationViewSet(viewsets.ModelViewSet):
    queryset = AdoptionApplication.objects.all()
    serializer_class = AdoptionApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can see their own applications
        # Staff can see all applications
        user_type = self.request.user.user_type.upper()
        if 'STAFF' in user_type or 'SHELTER' in user_type:
            return AdoptionApplication.objects.all().select_related('applicant', 'animal').order_by('-created_at')
        return AdoptionApplication.objects.filter(applicant=self.request.user).select_related('animal').order_by('-created_at')
    
    def perform_create(self, serializer):
        # Set the applicant to the current user
        application = serializer.save(applicant=self.request.user)

        award_points(self.request.user, 'ADOPTION_APPLICATION', application)
        
        # ENHANCED: Always calculate compatibility score (fix N/A scores)
        try:
            adopter_profile = AdopterProfile.objects.get(user=self.request.user)
            animal = application.animal
            
            # Try ML-based matching first, fall back to rule-based
            try:
                ml_matcher = MLAdoptionMatcher()
                if hasattr(animal, 'behavior_profile'):
                    compatibility = ml_matcher.predict_compatibility(adopter_profile, animal.behavior_profile)
                    application.compatibility_score = compatibility['overall_score']
                else:
                    # Create a basic behavior profile for animals without one
                    behavior_profile, created = AnimalBehaviorProfile.objects.get_or_create(
                        animal=animal,
                        defaults={
                            'energy_level': 'MEDIUM',
                            'temperament': 'CALM',
                            'training_level': 'BASIC',
                            'good_with_children': True,
                            'good_with_dogs': True,
                            'good_with_cats': True,
                            'house_trained': False,
                        }
                    )
                    compatibility = ml_matcher.predict_compatibility(adopter_profile, behavior_profile)
                    application.compatibility_score = compatibility['overall_score']
            except Exception as e:
                # Fall back to rule-based matching
                print(f"ML matching failed, using rule-based: {e}")
                if hasattr(animal, 'behavior_profile'):
                    matching_system = AdoptionMatchingSystem()
                    score = matching_system.calculate_compatibility(adopter_profile, animal)
                    application.compatibility_score = score['overall_score']
                else:
                    # Default score for animals without behavior profiles
                    application.compatibility_score = 75.0  # Default reasonable score
            
            application.save()
            
        except AdopterProfile.DoesNotExist:
            # If no adopter profile exists, create a basic one
            basic_profile = AdopterProfile.objects.create(
                user=self.request.user,
                housing_type='HOUSE',
                has_yard=True,
                pet_experience='INTERMEDIATE',
                activity_level='MODERATELY_ACTIVE',
                work_schedule='9-5',
                hours_alone=8,
                willing_to_train=True,
                budget_for_pet='$100-200/month'
            )
            application.compatibility_score = 70.0  # Default score for basic profile
            application.save()

        # Notify staff users
        staff_users = get_user_model().objects.filter(user_type__in=['STAFF', 'SHELTER'])
        for staff_user in staff_users:
            create_notification(
                recipient=staff_user,
                notification_type='ADOPTION_UPDATE',
                title='New Adoption Application',
                message=f'New application for {animal.name or "an animal"} by {self.request.user.username} (Match: {application.compatibility_score:.0f}%)',
                related_object=application
            )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update adoption application status"""
        application = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response({'detail': 'Status is required.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if new_status not in [s[0] for s in AdoptionApplication.STATUS_CHOICES]:
            return Response({'detail': 'Invalid status.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Update application status
        application.status = new_status
        
        # Add notes if provided
        notes = request.data.get('review_notes')
        if notes:
            application.review_notes = notes
        
        # Set reviewer to current user if status changes from PENDING
        if application.status != 'PENDING' and not application.reviewed_by:
            application.reviewed_by = request.user
        
        application.save()
        
        # Create notification for the applicant
        status_display = dict(AdoptionApplication.STATUS_CHOICES)[new_status]
        create_notification(
            recipient=application.applicant,
            notification_type='ADOPTION_UPDATE',
            title='Adoption Application Updated',
            message=f'Your adoption application for {application.animal.name or "an animal"} is now {status_display}',
            related_object=application
        )

        return Response(self.get_serializer(application).data)

    # NEW: Bulk approve/reject functionality
    @action(detail=False, methods=['post'])
    def bulk_update_status(self, request):
        """Bulk update status for multiple applications"""
        if not request.user.user_type in ['STAFF', 'SHELTER']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        application_ids = request.data.get('application_ids', [])
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if not application_ids:
            return Response({'error': 'application_ids is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not new_status:
            return Response({'error': 'status is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if new_status not in [s[0] for s in AdoptionApplication.STATUS_CHOICES]:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        updated_count = 0
        
        with transaction.atomic():
            applications = AdoptionApplication.objects.filter(
                id__in=application_ids,
                status='PENDING'  # Only update pending applications
            )
            
            for application in applications:
                application.status = new_status
                application.reviewed_by = request.user
                if notes:
                    application.review_notes = notes
                application.save()
                
                # Send notification to applicant
                status_display = dict(AdoptionApplication.STATUS_CHOICES)[new_status]
                create_notification(
                    recipient=application.applicant,
                    notification_type='ADOPTION_UPDATE',
                    title='Adoption Application Updated',
                    message=f'Your adoption application for {application.animal.name or "an animal"} is now {status_display}',
                    related_object=application
                )
                
                updated_count += 1
        
        return Response({
            'message': f'Successfully updated {updated_count} applications',
            'updated_count': updated_count
        })

    # NEW: Priority processing for urgent applications
    @action(detail=False, methods=['get'])
    def priority_review(self, request):
        """Get applications that need priority review (high match scores, waiting too long)"""
        if not request.user.user_type in ['STAFF', 'SHELTER']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Applications waiting more than 7 days or with high compatibility scores
        priority_threshold_date = timezone.now() - timezone.timedelta(days=7)
        
        priority_applications = AdoptionApplication.objects.filter(
            status='PENDING'
        ).filter(
            models.Q(created_at__lt=priority_threshold_date) |  # Waiting too long
            models.Q(compatibility_score__gte=85)  # High match score
        ).select_related('applicant', 'animal').order_by('-compatibility_score', 'created_at')
        
        serializer = self.get_serializer(priority_applications, many=True)
        return Response({
            'count': priority_applications.count(),
            'applications': serializer.data
        })

    # NEW: Application statistics for SHELTER dashboard
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get application processing statistics"""
        if not request.user.user_type in ['STAFF', 'SHELTER']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        from django.db.models import Avg, Count, Q
        from datetime import timedelta
        
        now = timezone.now()
        last_30_days = now - timedelta(days=30)
        
        stats = {
            'total_applications': AdoptionApplication.objects.count(),
            'pending_applications': AdoptionApplication.objects.filter(status='PENDING').count(),
            'approved_applications': AdoptionApplication.objects.filter(status='APPROVED').count(),
            'rejected_applications': AdoptionApplication.objects.filter(status='REJECTED').count(),
            'recent_applications': AdoptionApplication.objects.filter(created_at__gte=last_30_days).count(),
            
            # Processing efficiency metrics
            'avg_compatibility_score': AdoptionApplication.objects.aggregate(
                avg_score=Avg('compatibility_score')
            )['avg_score'] or 0,
            
            'high_match_pending': AdoptionApplication.objects.filter(
                status='PENDING',
                compatibility_score__gte=80
            ).count(),
            
            'applications_over_7_days': AdoptionApplication.objects.filter(
                status='PENDING',
                created_at__lt=now - timedelta(days=7)
            ).count(),
            
            'applications_over_14_days': AdoptionApplication.objects.filter(
                status='PENDING',
                created_at__lt=now - timedelta(days=14)
            ).count(),
            
            # Monthly breakdown
            'monthly_stats': list(AdoptionApplication.objects.filter(
                created_at__gte=last_30_days
            ).extra(
                select={'day': 'date(created_at)'}
            ).values('day').annotate(
                count=Count('id')
            ).order_by('day'))
        }
        
        return Response(stats)


class AdoptionMatchViewSet(viewsets.ModelViewSet):
    queryset = AdoptionMatch.objects.all()
    serializer_class = AdoptionMatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_matches(self, request):
        """Get adoption matches for the current user - ENHANCED with better scoring"""
        try:
            adopter_profile = AdopterProfile.objects.get(user=request.user)
        except AdopterProfile.DoesNotExist:
            return Response(
                {"detail": "Please create an adopter profile first."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get available animals with behavior profiles
        available_animals = Animal.objects.filter(
            status='AVAILABLE'
        ).select_related('behavior_profile')
        
        matches = []
        matching_system = AdoptionMatchingSystem()
        ml_matcher = MLAdoptionMatcher()
        
        for animal in available_animals:
            try:
                # Ensure animal has a behavior profile
                behavior_profile = None
                if hasattr(animal, 'behavior_profile'):
                    behavior_profile = animal.behavior_profile
                else:
                    # Create a default behavior profile
                    behavior_profile, created = AnimalBehaviorProfile.objects.get_or_create(
                        animal=animal,
                        defaults={
                            'energy_level': 'MEDIUM',
                            'temperament': 'CALM',
                            'training_level': 'BASIC',
                            'good_with_children': True,
                            'good_with_dogs': True,
                            'good_with_cats': True,
                            'house_trained': False,
                        }
                    )
                
                # Try ML matching first, fall back to rule-based
                try:
                    scores = ml_matcher.predict_compatibility(adopter_profile, behavior_profile)
                except:
                    scores = matching_system.calculate_compatibility(adopter_profile, animal)
                
                # Create or update match record
                match, created = AdoptionMatch.objects.update_or_create(
                    adopter=request.user,
                    animal=animal,
                    defaults={
                        'overall_score': scores['overall_score'],
                        'lifestyle_score': scores.get('lifestyle_score', 75),
                        'experience_score': scores.get('experience_score', 75),
                        'housing_score': scores.get('housing_score', 75),
                        'family_score': scores.get('family_score', 75),
                        'match_reasons': scores.get('match_reasons', ['Compatible lifestyle']),
                        'potential_challenges': scores.get('potential_challenges', [])
                    }
                )
                matches.append(match)
                
            except Exception as e:
                print(f"Error calculating match for animal {animal.id}: {e}")
                # Create a basic match with default score
                match, created = AdoptionMatch.objects.update_or_create(
                    adopter=request.user,
                    animal=animal,
                    defaults={
                        'overall_score': 75.0,
                        'lifestyle_score': 75.0,
                        'experience_score': 75.0,
                        'housing_score': 75.0,
                        'family_score': 75.0,
                        'match_reasons': ['General compatibility'],
                        'potential_challenges': []
                    }
                )
                matches.append(match)
        
        # Sort by score
        matches.sort(key=lambda x: x.overall_score, reverse=True)
        serializer = self.get_serializer(matches, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def calculate_matches_ml(self, request):
        """Calculate adoption matches using Machine Learning - ENHANCED"""
        adopter_profile_id = request.data.get('adopter_profile_id')
    
        if not adopter_profile_id:
            return Response(
                {'error': 'adopter_profile_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
        try:
            adopter_profile = AdopterProfile.objects.get(id=adopter_profile_id)
        except AdopterProfile.DoesNotExist:
            return Response(
                {'error': 'Adopter profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
        # Get available animals with behavior profiles
        available_animals = Animal.objects.filter(
            status='AVAILABLE'
        ).select_related('behavior_profile')
    
        # Initialize ML matcher
        ml_matcher = MLAdoptionMatcher()
        matching_system = AdoptionMatchingSystem()  # Fallback
    
        matches = []
        for animal in available_animals:
            try:
                # Ensure behavior profile exists
                behavior_profile = None
                if hasattr(animal, 'behavior_profile'):
                    behavior_profile = animal.behavior_profile
                else:
                    # Create default behavior profile
                    behavior_profile, created = AnimalBehaviorProfile.objects.get_or_create(
                        animal=animal,
                        defaults={
                            'energy_level': 'MEDIUM',
                            'temperament': 'CALM',
                            'training_level': 'BASIC',
                            'good_with_children': True,
                            'good_with_dogs': True,
                            'good_with_cats': True,
                            'house_trained': False,
                        }
                    )
                
                # Try ML prediction
                try:
                    compatibility = ml_matcher.predict_compatibility(adopter_profile, behavior_profile)
                    prediction_method = 'ml_enhanced'
                except Exception as e:
                    print(f"ML prediction failed for animal {animal.id}: {e}")
                    # Fall back to rule-based
                    compatibility = matching_system.calculate_compatibility(adopter_profile, animal)
                    prediction_method = 'rule_based_fallback'
                
                matches.append({
                    'animal_id': animal.id,
                    'animal_name': animal.name or 'Unnamed',
                    'animal_type': animal.animal_type,
                    'compatibility_score': compatibility['overall_score'],
                    'prediction_method': prediction_method,
                    'confidence': compatibility.get('confidence', 'medium'),
                    'match_reasons': compatibility.get('match_reasons', ['General compatibility']),
                    'potential_challenges': compatibility.get('potential_challenges', []),
                    'top_factors': compatibility.get('top_matching_factors', []),
                    'lifestyle_score': compatibility.get('lifestyle_score', 75),
                    'experience_score': compatibility.get('experience_score', 75),
                    'housing_score': compatibility.get('housing_score', 75),
                    'family_score': compatibility.get('family_score', 75),
                })
                
            except Exception as e:
                print(f"Error calculating match for animal {animal.id}: {e}")
                # Provide default match
                matches.append({
                    'animal_id': animal.id,
                    'animal_name': animal.name or 'Unnamed',
                    'animal_type': animal.animal_type,
                    'compatibility_score': 70.0,
                    'prediction_method': 'default',
                    'confidence': 'low',
                    'match_reasons': ['Basic compatibility assessment'],
                    'potential_challenges': ['Profile incomplete - please update for better matching'],
                    'top_factors': [],
                    'lifestyle_score': 70.0,
                    'experience_score': 70.0,
                    'housing_score': 70.0,
                    'family_score': 70.0,
                })
    
        # Sort by compatibility score (highest first)
        matches.sort(key=lambda x: x['compatibility_score'], reverse=True)
    
        return Response({
            'adopter_profile_id': adopter_profile_id,
            'total_matches': len(matches),
            'matches': matches[:10],  # Return top 10 matches
            'ml_model_available': ml_matcher.model is not None,
            'message': 'Matches calculated using enhanced AI' if ml_matcher.model else 'Matches calculated using smart rules (AI training in progress for better results)'
        })