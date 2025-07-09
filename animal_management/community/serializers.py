from rest_framework import serializers
from .models import (
    UserActivity, Reward, RewardRedemption, Achievement, UserAchievement,
    ForumCategory, ForumTopic, ForumPost, ForumPostLike,
    KnowledgeArticle, ArticleHelpfulVote
)

class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class RewardRedemptionSerializer(serializers.ModelSerializer):
    reward_name = serializers.CharField(source='reward.name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    processed_by_username = serializers.CharField(source='processed_by.username', read_only=True)
    
    class Meta:
        model = RewardRedemption
        fields = '__all__'
        read_only_fields = ('id', 'redemption_date', 'processed_date', 'processed_by')

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

class UserAchievementSerializer(serializers.ModelSerializer):
    achievement_name = serializers.CharField(source='achievement.name', read_only=True)
    achievement_description = serializers.CharField(source='achievement.description', read_only=True)
    achievement_icon = serializers.CharField(source='achievement.icon', read_only=True)
    achievement_category = serializers.CharField(source='achievement.category', read_only=True)
    
    class Meta:
        model = UserAchievement
        fields = '__all__'
        read_only_fields = ('id', 'earned_at')

class ForumCategorySerializer(serializers.ModelSerializer):
    topic_count = serializers.ReadOnlyField()
    post_count = serializers.ReadOnlyField()
    allowed_user_types = serializers.JSONField(default=list)
    
    class Meta:
        model = ForumCategory
        fields = [
            'id', 'name', 'description', 'icon', 'order', 'is_active', 
            'created_at', 'topic_count', 'post_count', 'allowed_user_types'
        ]
        read_only_fields = ('id', 'created_at', 'topic_count', 'post_count')

class ForumTopicSerializer(serializers.ModelSerializer):
    created_by_username = serializers.ReadOnlyField()
    post_count = serializers.ReadOnlyField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    last_post_date = serializers.SerializerMethodField()
    
    def get_last_post_date(self, obj):
        last_post = obj.last_post
        return last_post.created_at if last_post else None
    
    class Meta:
        model = ForumTopic
        fields = [
            'id', 'title', 'category', 'category_name', 'created_by', 'created_by_username',
            'is_pinned', 'is_locked', 'views', 'post_count', 'last_post_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_by', 'created_by_username', 'views', 'created_at', 'updated_at')

class ForumPostSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField()
    likes_count = serializers.ReadOnlyField()
    user_has_liked = serializers.SerializerMethodField()
    topic_title = serializers.CharField(source='topic.title', read_only=True)
    
    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user_has_liked(request.user)
        return False
    
    class Meta:
        model = ForumPost
        fields = [
            'id', 'topic', 'topic_title', 'author', 'author_username', 'content',
            'is_solution', 'likes_count', 'user_has_liked', 'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'author', 'author_username', 'created_at', 'updated_at')

class KnowledgeArticleSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = KnowledgeArticle
        fields = '__all__'
        read_only_fields = ('id', 'slug', 'author', 'view_count', 'helpful_count', 'created_at', 'updated_at')

class ArticleHelpfulVoteSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    article_title = serializers.CharField(source='article.title', read_only=True)
    
    class Meta:
        model = ArticleHelpfulVote
        fields = '__all__'
        read_only_fields = ('id', 'created_at')
