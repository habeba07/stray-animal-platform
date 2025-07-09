from rest_framework import serializers

from .models import ( ResourceCategory, EducationalResource, ResourceRating,
    InteractiveLearningModule, 
    LearningProgress, 
    QuizQuestion, 
    UserQuizAttempt
)

from users.serializers import UserSerializer

class ResourceCategorySerializer(serializers.ModelSerializer):
    resource_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ResourceCategory
        fields = ['id', 'name', 'slug', 'description', 'icon', 'order', 'resource_count']
    
    def get_resource_count(self, obj):
        return obj.resources.filter(is_published=True).count()


class ResourceRatingSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = ResourceRating
        fields = ['id', 'resource', 'user', 'user_details', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']


class EducationalResourceSerializer(serializers.ModelSerializer):
    category_details = ResourceCategorySerializer(source='category', read_only=True)
    author_details = UserSerializer(source='author', read_only=True)
    average_rating = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()
    
    class Meta:
        model = EducationalResource
        fields = ['id', 'title', 'slug', 'category', 'category_details', 'resource_type', 
                 'content', 'summary', 'featured_image', 'author', 'author_details', 
                 'is_published', 'view_count', 'average_rating', 'rating_count', 
                 'created_at', 'updated_at']
        read_only_fields = ['author', 'view_count', 'created_at', 'updated_at']
    
    def get_average_rating(self, obj):
        ratings = obj.ratings.all()
        if not ratings:
            return None
        return sum(r.rating for r in ratings) / len(ratings)
    
    def get_rating_count(self, obj):
        return obj.ratings.count()
class QuizQuestionSerializer(serializers.ModelSerializer):
    """Serialize quiz questions"""
    class Meta:
        model = QuizQuestion
        fields = [
            'id', 'question_text', 'question_type', 'order', 
            'question_data', 'explanation', 'points'
        ]


class InteractiveLearningModuleSerializer(serializers.ModelSerializer):
    """Serialize interactive learning modules"""
    quiz_questions = QuizQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = InteractiveLearningModule
        fields = [
            'id', 'module_type', 'is_active', 'content_data',
            'requires_completion', 'passing_score', 'estimated_duration',
            'quiz_questions'
        ]


class LearningProgressSerializer(serializers.ModelSerializer):
    """Serialize user learning progress"""
    module_title = serializers.CharField(source='module.resource.title', read_only=True)
    module_type = serializers.CharField(source='module.module_type', read_only=True)
    is_passed = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = LearningProgress
        fields = [
            'id', 'module', 'module_title', 'module_type', 'status',
            'completion_percentage', 'current_step', 'latest_score',
            'best_score', 'attempts_count', 'progress_data',
            'started_at', 'completed_at', 'total_time_spent', 'is_passed'
        ]


class UserQuizAttemptSerializer(serializers.ModelSerializer):
    """Serialize quiz attempts"""
    class Meta:
        model = UserQuizAttempt
        fields = [
            'id', 'score_percentage', 'correct_answers', 'total_questions',
            'answers_data', 'started_at', 'completed_at', 'time_spent_minutes'
        ]

class EnhancedEducationalResourceSerializer(serializers.ModelSerializer):
    """Enhanced version of your existing serializer"""
    interactive_module = InteractiveLearningModuleSerializer(read_only=True)
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = EducationalResource
        fields = [
            'id', 'title', 'slug', 'category', 'resource_type', 
            'content', 'summary', 'featured_image', 'author',
            'is_published', 'view_count', 'created_at', 'updated_at',
            'interactive_module', 'user_progress'
        ]
    
    def get_user_progress(self, obj):
        """Get current user's progress on this resource"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                if hasattr(obj, 'interactive_module'):
                    progress = LearningProgress.objects.get(
                        user=request.user, 
                        module=obj.interactive_module
                    )
                    return LearningProgressSerializer(progress).data
            except LearningProgress.DoesNotExist:
                pass
        return None
