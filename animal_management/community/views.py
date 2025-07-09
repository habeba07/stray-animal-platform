# community/views.py - Enhanced version with user type filtering
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.db.models import Sum
from django.utils import timezone

# Import models first
from .models import (
    UserActivity, Reward, RewardRedemption, Achievement, UserAchievement,
    ForumCategory, ForumTopic, ForumPost, ForumPostLike, 
    KnowledgeArticle, ArticleHelpfulVote
)

# Import User model
from users.models import User

# Import serializers AFTER models are imported
from .serializers import (
    UserActivitySerializer, RewardSerializer, RewardRedemptionSerializer,
    AchievementSerializer, UserAchievementSerializer, 
    ForumCategorySerializer, ForumTopicSerializer, ForumPostSerializer,
    KnowledgeArticleSerializer, ArticleHelpfulVoteSerializer
)


class UserActivityViewSet(viewsets.ModelViewSet):
    queryset = UserActivity.objects.all()
    serializer_class = UserActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own activities unless they're staff
        if self.request.user.is_staff:
            return UserActivity.objects.all()
        return UserActivity.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_activities(self, request):
        """Get current user's activities"""
        activities = UserActivity.objects.filter(user=request.user)
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_points(self, request):
        """Get current user's points summary"""
        total_points = request.user.points
        points_by_type = UserActivity.objects.filter(user=request.user).values('activity_type').annotate(
            total=Sum('points_earned')
        )
        
        return Response({
            'total_points': total_points,
            'points_by_activity': points_by_type,
            'recent_activities': UserActivitySerializer(
                UserActivity.objects.filter(user=request.user)[:5], 
                many=True
            ).data
        })
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Get top 10 users by points"""
        top_users = User.objects.filter(points__gt=0).order_by('-points')[:10]
        
        leaderboard_data = []
        for user in top_users:
            leaderboard_data.append({
                'username': user.username,
                'points': user.points,
                'user_type': user.user_type
            })
        
        return Response(leaderboard_data)


class RewardViewSet(viewsets.ModelViewSet):
    queryset = Reward.objects.filter(is_active=True)
    serializer_class = RewardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=True, methods=['post'])
    def redeem(self, request, pk=None):
        """Redeem a reward"""
        reward = self.get_object()
        user = request.user
        
        # Check if user has enough points
        if user.points < reward.points_required:
            raise ValidationError("Insufficient points for this reward")
        
        # Check if reward is available
        if not reward.is_available:
            raise ValidationError("This reward is not available")
        
        # Check quantity
        if reward.quantity_available > 0:
            reward.quantity_available -= 1
            reward.save()
        
        # Deduct points from user
        user.points -= reward.points_required
        user.save()
        
        # Create redemption record
        redemption = RewardRedemption.objects.create(
            user=user,
            reward=reward,
            points_spent=reward.points_required
        )
        
        # Log activity
        UserActivity.objects.create(
            user=user,
            activity_type='REWARD_REDEEMED',
            points_earned=-reward.points_required,
            description=f"Redeemed {reward.name}",
            related_object_id=redemption.id,
            related_object_type='rewardredemption'
        )
        
        serializer = RewardRedemptionSerializer(redemption)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RewardRedemptionViewSet(viewsets.ModelViewSet):
    queryset = RewardRedemption.objects.all()
    serializer_class = RewardRedemptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return RewardRedemption.objects.all()
        return RewardRedemption.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_redemptions(self, request):
        """Get user's redemption history"""
        redemptions = RewardRedemption.objects.filter(user=request.user)
        serializer = self.get_serializer(redemptions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Process a redemption (staff only)"""
        if not request.user.is_staff:
            return Response(
                {"error": "Only staff can process redemptions"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        redemption = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if new_status not in ['APPROVED', 'DELIVERED', 'REJECTED']:
            return Response(
                {"error": "Invalid status"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        redemption.status = new_status
        redemption.processed_date = timezone.now()
        redemption.processed_by = request.user
        redemption.notes = notes
        redemption.save()
        
        serializer = self.get_serializer(redemption)
        return Response(serializer.data)


class AchievementViewSet(viewsets.ModelViewSet):
    queryset = Achievement.objects.filter(is_active=True)
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def my_achievements(self, request):
        """Get user's earned achievements"""
        user_achievements = UserAchievement.objects.filter(user=request.user)
        serializer = UserAchievementSerializer(user_achievements, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get achievements user hasn't earned yet"""
        earned_ids = UserAchievement.objects.filter(user=request.user).values_list('achievement_id', flat=True)
        available = Achievement.objects.filter(is_active=True).exclude(id__in=earned_ids)
        serializer = self.get_serializer(available, many=True)
        return Response(serializer.data)


# ENHANCED Forum ViewSets with User Type Filtering
class ForumCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Forum categories with user type filtering"""
    queryset = ForumCategory.objects.filter(is_active=True)
    serializer_class = ForumCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Filter categories based on user type"""
        queryset = ForumCategory.objects.filter(is_active=True)
        
        # Get user type - default to PUBLIC for unauthenticated users
        if self.request.user.is_authenticated:
            user_type = getattr(self.request.user, 'user_type', 'PUBLIC')
        else:
            user_type = 'PUBLIC'
        
        # Filter categories that are accessible to this user type
        accessible_categories = []
        for category in queryset:
            if category.is_accessible_by_user_type(user_type):
                accessible_categories.append(category.id)
        
        return queryset.filter(id__in=accessible_categories).order_by('order', 'name')
    
    @action(detail=False, methods=['get'])
    def by_user_type(self, request):
        """Get categories explicitly filtered by user type"""
        user_type = request.query_params.get('user_type', 'PUBLIC')
        
        # Validate user type
        valid_types = ['PUBLIC', 'SHELTER', 'VOLUNTEER', 'STAFF', 'AUTHORITY']
        if user_type not in valid_types:
            return Response(
                {"error": f"Invalid user type. Must be one of: {valid_types}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = ForumCategory.objects.filter(is_active=True)
        accessible_categories = []
        
        for category in queryset:
            if category.is_accessible_by_user_type(user_type):
                accessible_categories.append(category.id)
        
        filtered_queryset = queryset.filter(id__in=accessible_categories).order_by('order', 'name')
        serializer = self.get_serializer(filtered_queryset, many=True)
        
        return Response({
            'user_type': user_type,
            'categories': serializer.data,
            'total_categories': len(serializer.data)
        })


class ForumTopicViewSet(viewsets.ModelViewSet):
    """Forum topics - users can create and view topics"""
    queryset = ForumTopic.objects.select_related('created_by', 'category')
    serializer_class = ForumTopicSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = ForumTopic.objects.select_related('created_by', 'category')
        category_id = self.request.query_params.get('category', None)
        
        if category_id:
            # Check if user has access to this category
            try:
                category = ForumCategory.objects.get(id=category_id, is_active=True)
                user_type = getattr(self.request.user, 'user_type', 'PUBLIC')
                
                if not category.is_accessible_by_user_type(user_type):
                    return ForumTopic.objects.none()  # Return empty queryset
                
                queryset = queryset.filter(category_id=category_id)
            except ForumCategory.DoesNotExist:
                return ForumTopic.objects.none()
        
        return queryset.order_by('-is_pinned', '-updated_at')
    
    def perform_create(self, serializer):
        # Check if user has access to the category
        category = serializer.validated_data['category']
        user_type = getattr(self.request.user, 'user_type', 'PUBLIC')
        
        if not category.is_accessible_by_user_type(user_type):
            raise ValidationError("You don't have permission to post in this category")
        
        serializer.save(created_by=self.request.user)


class ForumPostViewSet(viewsets.ModelViewSet):
    """Forum posts - users can create posts in topics"""
    queryset = ForumPost.objects.select_related('author', 'topic')
    serializer_class = ForumPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        topic_id = self.request.query_params.get('topic', None)
        
        if topic_id:
            try:
                topic = ForumTopic.objects.select_related('category').get(id=topic_id)
                user_type = getattr(self.request.user, 'user_type', 'PUBLIC')
                
                # Check if user has access to the category
                if not topic.category.is_accessible_by_user_type(user_type):
                    return ForumPost.objects.none()
                
                return ForumPost.objects.filter(topic_id=topic_id).select_related('author', 'topic')
            except ForumTopic.DoesNotExist:
                return ForumPost.objects.none()
        
        return ForumPost.objects.select_related('author', 'topic').order_by('-created_at')
    
    def perform_create(self, serializer):
        # Check if user has access to the topic's category
        topic = serializer.validated_data['topic']
        user_type = getattr(self.request.user, 'user_type', 'PUBLIC')
        
        if not topic.category.is_accessible_by_user_type(user_type):
            raise ValidationError("You don't have permission to post in this category")
        
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Like or unlike a post"""
        post = self.get_object()
        user = request.user
        
        # Check if user has access to this post's category
        user_type = getattr(user, 'user_type', 'PUBLIC')
        if not post.topic.category.is_accessible_by_user_type(user_type):
            return Response(
                {"error": "You don't have permission to interact with this post"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        like, created = ForumPostLike.objects.get_or_create(
            post=post,
            user=user
        )
        
        if not created:
            # If like already exists, remove it (unlike)
            like.delete()
            action = 'unliked'
        else:
            action = 'liked'
        
        return Response({
            'action': action,
            'likes_count': post.likes_count
        })


class KnowledgeArticleViewSet(viewsets.ModelViewSet):
    """Knowledge base articles"""
    queryset = KnowledgeArticle.objects.filter(is_published=True)
    serializer_class = KnowledgeArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)