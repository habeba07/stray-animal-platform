# Replace your ENTIRE resources/views.py with this enhanced version

from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count
from django.utils import timezone

from community.services import (
    track_training_started,
    track_training_completed,
    track_quiz_passed
)

from .models import (
    ResourceCategory, EducationalResource, ResourceRating,
    InteractiveLearningModule, LearningProgress, QuizQuestion, UserQuizAttempt
)
from .serializers import (
    ResourceCategorySerializer,
    EducationalResourceSerializer,
    ResourceRatingSerializer,
    EnhancedEducationalResourceSerializer,  # Use the enhanced version
    InteractiveLearningModuleSerializer,
    LearningProgressSerializer,
    QuizQuestionSerializer,
    UserQuizAttemptSerializer
)



class ResourceCategoryViewSet(viewsets.ModelViewSet):
    """Your existing category viewset - unchanged"""
    queryset = ResourceCategory.objects.all()
    serializer_class = ResourceCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]


class EducationalResourceViewSet(viewsets.ModelViewSet):
    """Enhanced version of your existing resource viewset"""
    queryset = EducationalResource.objects.filter(is_published=True)
    serializer_class = EnhancedEducationalResourceSerializer  # Use enhanced serializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'summary', 'content']

    def get_queryset(self):
        queryset = super().get_queryset()
        category_slug = self.request.query_params.get('category__slug')
        
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
            
        return queryset
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        instance.view_count += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured resources (most viewed)"""
        featured = self.queryset.order_by('-view_count')[:5]
        serializer = self.get_serializer(featured, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get resources grouped by category"""
        categories = ResourceCategory.objects.all()
        result = []
        
        for category in categories:
            resources = self.queryset.filter(category=category)[:5]  # Limit to 5 per category
            if resources:
                result.append({
                    'category': ResourceCategorySerializer(category).data,
                    'resources': self.get_serializer(resources, many=True).data
                })
        
        return Response(result)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def start_learning(self, request, slug=None):
        """Start or resume learning for this resource"""
        resource = self.get_object()
    
        try:
            module = resource.interactive_module
        except InteractiveLearningModule.DoesNotExist:
            return Response(
                {"error": "This resource doesn't have interactive learning features"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
        # Get or create learning progress
        progress, created = LearningProgress.objects.get_or_create(
            user=request.user,
            module=module,
            defaults={
                'status': 'IN_PROGRESS',
                'started_at': timezone.now()
            }
        )
    
        if created:
            # 🎯 INTEGRATION: Track learning start
            try:
                track_training_started(request.user, resource)
            except ImportError:
                pass  # Community app might not be available
    
        serializer = LearningProgressSerializer(progress)
        return Response(serializer.data)
       
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def update_progress(self, request, slug=None):
        """Update learning progress"""
        resource = self.get_object()
    
        try:
            module = resource.interactive_module
            progress = LearningProgress.objects.get(user=request.user, module=module)
        except (InteractiveLearningModule.DoesNotExist, LearningProgress.DoesNotExist):
            return Response(
                {"error": "Learning progress not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
        # Update progress data
        completion_percentage = request.data.get('completion_percentage', progress.completion_percentage)
        current_step = request.data.get('current_step', progress.current_step)
        time_spent = request.data.get('time_spent', 0)
    
        progress.completion_percentage = min(100, max(0, completion_percentage))
        progress.current_step = current_step
        progress.total_time_spent += time_spent
        progress.last_accessed = timezone.now()
    
        # Update progress data (store custom data like video timestamps watched)
        if 'progress_data' in request.data:
            progress.progress_data.update(request.data['progress_data'])
    
        # Check if completed
        if progress.completion_percentage >= 100:
            progress.status = 'COMPLETED'
            if not progress.completed_at:
                progress.completed_at = timezone.now()
                # 🎯 INTEGRATION: Track training completion
                try:
                    track_training_completed(request.user, resource)
                except ImportError:
                    pass
    
        progress.save()
    
        serializer = LearningProgressSerializer(progress)
        return Response(serializer.data)

    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit_quiz(self, request, slug=None):
        """Submit quiz answers"""
        resource = self.get_object()
    
        try:
            module = resource.interactive_module
            progress = LearningProgress.objects.get(user=request.user, module=module)
        except (InteractiveLearningModule.DoesNotExist, LearningProgress.DoesNotExist):
            return Response(
                {"error": "Learning progress not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
        if module.module_type != 'QUIZ':
            return Response(
                {"error": "This module is not a quiz"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
        answers = request.data.get('answers', {})
        started_at_str = request.data.get('started_at')
    
        # Handle JavaScript ISO format with 'Z' timezone indicator
        if started_at_str.endswith('Z'):
            started_at_str = started_at_str[:-1] + '+00:00'
        started_at = timezone.datetime.fromisoformat(started_at_str)
        completed_at = timezone.now()
    
        # Calculate score
        questions = module.quiz_questions.all()
        total_questions = questions.count()
        correct_answers = 0
    
        for question in questions:
            question_id = str(question.id)
            user_answer = answers.get(question_id)
        
            # Check if answer is correct (simplified logic)
            if question.question_type == 'MULTIPLE_CHOICE':
                correct_index = question.question_data.get('correct', 0)
                if user_answer == correct_index:
                    correct_answers += 1
            elif question.question_type == 'TRUE_FALSE':
                if user_answer == question.question_data.get('correct'):
                    correct_answers += 1
            # Add more question types as needed
    
        score_percentage = int((correct_answers / total_questions) * 100) if total_questions > 0 else 0
        time_spent_minutes = int((completed_at - started_at).total_seconds() / 60)
    
        # Create quiz attempt record
        attempt = UserQuizAttempt.objects.create(
            progress=progress,
            score_percentage=score_percentage,
            correct_answers=correct_answers,
            total_questions=total_questions,
            answers_data=answers,
            started_at=started_at,
            completed_at=completed_at,
            time_spent_minutes=time_spent_minutes
        )
    
        # Update progress
        progress.attempts_count += 1
        progress.latest_score = score_percentage
        progress.total_time_spent += time_spent_minutes
    
        if not progress.best_score or score_percentage > progress.best_score:
            progress.best_score = score_percentage
    
        # Check if passed
        if score_percentage >= module.passing_score:
            progress.status = 'PASSED'
            if not progress.completed_at:
                progress.completed_at = completed_at
            
                # 🎯 INTEGRATION: Track quiz passed
                try:
                    track_quiz_passed(request.user, resource, score_percentage)
                except ImportError:
                    pass
        else:
            progress.status = 'FAILED'
    
        progress.save()
    
        return Response({
            'attempt': UserQuizAttemptSerializer(attempt).data,
            'progress': LearningProgressSerializer(progress).data,
            'passed': score_percentage >= module.passing_score,
            'points_earned': 20 if score_percentage >= module.passing_score else 0  # Quiz passing points
        })

class ResourceRatingViewSet(viewsets.ModelViewSet):
    """Your existing rating viewset - unchanged"""
    queryset = ResourceRating.objects.all()
    serializer_class = ResourceRatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return ResourceRating.objects.all()
        return ResourceRating.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Check if user has already rated this resource
        resource_id = self.request.data.get('resource')
        existing_rating = ResourceRating.objects.filter(
            user=self.request.user, 
            resource_id=resource_id
        ).first()
        
        if existing_rating:
            return Response(
                {"detail": "You have already rated this resource."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save(user=self.request.user)
        
        # Award points for rating a resource
        try:
            from community.services import award_points
            resource = EducationalResource.objects.get(id=resource_id)
            award_points(self.request.user, 'RESOURCE_RATING', resource)
        except (ImportError, EducationalResource.DoesNotExist):
            pass
    
    @action(detail=False, methods=['get'])
    def resource_ratings(self, request):
        """Get ratings for a specific resource"""
        resource_id = request.query_params.get('resource_id')
        if not resource_id:
            return Response(
                {"detail": "Resource ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ratings = ResourceRating.objects.filter(resource_id=resource_id)
        serializer = self.get_serializer(ratings, many=True)
        return Response(serializer.data)


# NEW VIEWSETS FOR INTERACTIVE LEARNING

class LearningProgressViewSet(viewsets.ModelViewSet):
    """Manage user learning progress"""
    serializer_class = LearningProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return LearningProgress.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_progress(self, request):
        """Get all learning progress for current user"""
        progress = self.get_queryset().select_related('module__resource')
        serializer = self.get_serializer(progress, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get learning dashboard data"""
        user_progress = self.get_queryset()
        
        stats = {
            'total_modules': user_progress.count(),
            'completed': user_progress.filter(status='COMPLETED').count(),
            'passed': user_progress.filter(status='PASSED').count(),
            'in_progress': user_progress.filter(status='IN_PROGRESS').count(),
            'total_time_spent': sum(p.total_time_spent for p in user_progress),
            'average_score': user_progress.exclude(latest_score__isnull=True).aggregate(
                avg_score=Avg('latest_score')
            )['avg_score'] or 0
        }
        
        recent_progress = user_progress.order_by('-last_accessed')[:5]
        
        return Response({
            'stats': stats,
            'recent_progress': self.get_serializer(recent_progress, many=True).data
        })
