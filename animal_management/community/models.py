from django.db import models
from django.conf import settings
from django.utils import timezone
from django.db.models import Sum

class UserActivity(models.Model):
    ACTIVITY_TYPES = (
        ('REPORT_ANIMAL', 'Reported a stray animal'),
        ('ADOPTION_APPLICATION', 'Applied for adoption'),
        ('ADOPTION_COMPLETED', 'Completed an adoption'),
        ('DONATION_MADE', 'Made a donation'),
        ('VOLUNTEER_HOURS', 'Logged volunteer hours'),
        ('PROFILE_CREATED', 'Created adopter profile'),
        ('FIRST_REPORT', 'Made first report'),
        ('RESCUE_COMPLETED', 'Completed a rescue mission'),
        ('REWARD_REDEEMED', 'Redeemed a reward'),
        ('VOLUNTEER_HOURS', 'Volunteered hours'),
        ('RESOURCE_RATING', 'Rated an educational resource'),
        ('VIRTUAL_ADOPTION', 'Virtually adopted an animal'),
        ('RESCUE_ACCEPTED', 'Accepted rescue assignment'),
        ('RESCUE_COMPLETED', 'Completed rescue mission'),
        ('RESCUE_CANCELLED', 'Cancelled rescue assignment'),
        ('EMERGENCY_RESPONSE', 'Responded to emergency rescue'),
        ('TRAINING_COMPLETED', 'Completed training module'),
        ('CERTIFICATION_EARNED', 'Earned skill certification'),
        ('FAST_RESPONSE', 'Fast response time (under 15 min)'),
        ('MULTIPLE_RESCUES_DAY', 'Multiple rescues in one day'),
        ('RESCUE_COLLABORATION', 'Collaborated on rescue mission'),
    )
    
    POINT_VALUES = {
        'REPORT_ANIMAL': 10,
        'ADOPTION_APPLICATION': 20,
        'ADOPTION_COMPLETED': 100,
        'DONATION_MADE': 50,
        'VOLUNTEER_HOURS': 15,
        'PROFILE_CREATED': 30,
        'FIRST_REPORT': 25,
        'RESCUE_COMPLETED': 75,
        'REWARD_REDEEMED': 0,
        'RESOURCE_RATING': 5,
        'VIRTUAL_ADOPTION': 100,
        'RESCUE_ACCEPTED': 25,           
        'RESCUE_CANCELLED': -10,        
        'EMERGENCY_RESPONSE': 50,       
        'TRAINING_COMPLETED': 20,        
        'CERTIFICATION_EARNED': 100,    
        'FAST_RESPONSE': 30,            
        'MULTIPLE_RESCUES_DAY': 40,      
        'RESCUE_COLLABORATION': 15,      
    }      
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPES)
    points_earned = models.IntegerField()
    description = models.CharField(max_length=255)
    related_object_id = models.IntegerField(blank=True, null=True)  # ID of report, adoption, donation, etc.
    related_object_type = models.CharField(max_length=50, blank=True, null=True)  # 'report', 'adoption', etc.
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'User activities'
    
    def __str__(self):
        return f"{self.user.username} - {self.activity_type} - {self.points_earned} points"
    
    @classmethod
    def create_activity(cls, user, activity_type, related_object=None):
        """Create an activity and award points to the user"""
        points = cls.POINT_VALUES.get(activity_type, 0)
        
        # Create the activity record
        activity = cls.objects.create(
            user=user,
            activity_type=activity_type,
            points_earned=points,
            description=dict(cls.ACTIVITY_TYPES)[activity_type],
            related_object_id=related_object.id if related_object else None,
            related_object_type=related_object.__class__.__name__.lower() if related_object else None
        )
        
        # Award points to user
        user.points += points
        user.save()
        
        return activity

class Reward(models.Model):
    REWARD_TYPES = (
        ('PHYSICAL', 'Physical Item'),
        ('DISCOUNT', 'Discount Coupon'),
        ('SERVICE', 'Service'),
        ('RECOGNITION', 'Recognition Badge'),
        ('PRIVILEGE', 'Special Privilege'),
    )
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    reward_type = models.CharField(max_length=20, choices=REWARD_TYPES)
    points_required = models.IntegerField()
    quantity_available = models.IntegerField(default=-1)  # -1 means unlimited
    image_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.points_required} points)"
    
    @property
    def is_available(self):
        return self.is_active and (self.quantity_available == -1 or self.quantity_available > 0)


class RewardRedemption(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('DELIVERED', 'Delivered'),
        ('REJECTED', 'Rejected'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='redemptions')
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE, related_name='redemptions')
    points_spent = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    redemption_date = models.DateTimeField(auto_now_add=True)
    processed_date = models.DateTimeField(blank=True, null=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='processed_redemptions'
    )
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.reward.name} - {self.status}"


class Achievement(models.Model):
    ACHIEVEMENT_CATEGORIES = (
        ('REPORTING', 'Animal Reporting'),
        ('ADOPTION', 'Adoption'),
        ('DONATION', 'Donations'),
        ('VOLUNTEER', 'Volunteering'),
        ('COMMUNITY', 'Community Engagement'),
        ('RESCUE', 'Rescue Operations'),
        ('TRAINING', 'Training & Certification'),
    )
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=ACHIEVEMENT_CATEGORIES)
    icon = models.CharField(max_length=50, default='star')  # Material UI icon name
    criteria = models.JSONField()  # Stores the criteria for earning this achievement
    points_reward = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    def check_criteria(self, user):
        """Check if a user meets the criteria for this achievement"""
        criteria_type = self.criteria.get('type')
    
        if criteria_type == 'report_count':
            return user.reports.count() >= self.criteria.get('count', 0)
    
        elif criteria_type == 'adoption_count':
            return user.adoption_applications.filter(status='APPROVED').count() >= self.criteria.get('count', 0)
        
        elif criteria_type == 'donation_amount':
      
            total = user.donation_set.aggregate(Sum('amount'))['amount__sum'] or 0
            return total >= self.criteria.get('amount', 0)
        
        elif criteria_type == 'points_earned':
            return user.points >= self.criteria.get('points', 0)
        
        elif criteria_type == 'activity_count':
            activity_type = self.criteria.get('activity_type')
            count = user.activities.filter(activity_type=activity_type).count()
            return count >= self.criteria.get('count', 0)
        
        elif criteria_type == 'rescue_count':
            completed_rescues = user.rescue_assignments.filter(status='COMPLETED').count()
            return completed_rescues >= self.criteria.get('count', 0)
        
        elif criteria_type == 'rescue_response_time':
            avg_response = user.volunteer_profile.average_response_time_minutes if hasattr(user, 'volunteer_profile') else None
            target_time = self.criteria.get('max_minutes', 15)
            return avg_response and avg_response <= target_time
        
        elif criteria_type == 'training_completion':
            if hasattr(user, 'volunteer_profile'):
                completed_training = user.volunteer_profile.training_progress.filter(
                    progress_percentage=100
                ).count()
                return completed_training >= self.criteria.get('count', 1)
            return False
        
        elif criteria_type == 'certification_count':
            if hasattr(user, 'volunteer_profile'):
                active_certs = user.volunteer_profile.certifications.filter(is_active=True).count()
                return active_certs >= self.criteria.get('count', 1)
            return False
        
        elif criteria_type == 'emergency_rescues':
            # Count emergency rescues (would need urgency tracking in assignments)
            emergency_count = user.rescue_assignments.filter(
                status='COMPLETED',
                report__urgency_level__in=['HIGH', 'EMERGENCY']
            ).count()
            return emergency_count >= self.criteria.get('count', 1)
    
        return False


class UserAchievement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'achievement')
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.achievement.name}"


class ForumCategory(models.Model):
    USER_TYPE_CHOICES = (
        ('PUBLIC', 'Public'),
        ('SHELTER', 'Shelter'),
        ('VOLUNTEER', 'Volunteer'),
        ('STAFF', 'Staff'),
        ('AUTHORITY', 'Authority'),
    )
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='forum')  # Material UI icon name
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # NEW: Define which user types can access this category
    allowed_user_types = models.JSONField(
        default=list,
        help_text="List of user types that can access this category (e.g., ['SHELTER', 'STAFF'])"
    )
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'Forum categories'
    
    def __str__(self):
        return self.name
    
    @property
    def topic_count(self):
        return self.topics.count()
    
    @property
    def post_count(self):
        return ForumPost.objects.filter(topic__category=self).count()
    
    def is_accessible_by_user_type(self, user_type):
        """Check if a user type can access this category"""
        if not self.allowed_user_types:
            # If no restrictions set, allow all user types
            return True
        return user_type in self.allowed_user_types

class ForumTopic(models.Model):
    title = models.CharField(max_length=200)
    category = models.ForeignKey(ForumCategory, on_delete=models.CASCADE, related_name='topics')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_topics')
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_pinned', '-updated_at']
    
    def __str__(self):
        return self.title
    
    @property
    def post_count(self):
        return self.posts.count()
    
    @property
    def last_post(self):
        return self.posts.order_by('-created_at').first()
    
    @property
    def created_by_username(self):
        return self.created_by.username if self.created_by else 'Unknown'

class ForumPost(models.Model):
    topic = models.ForeignKey(ForumTopic, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_posts')
    content = models.TextField()
    is_solution = models.BooleanField(default=False)  # Mark helpful posts
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Post by {self.author.username} in {self.topic.title}"
    
    @property
    def author_username(self):
        return self.author.username if self.author else 'Unknown'
    
    @property
    def likes_count(self):
        return self.likes.count()
    
    def user_has_liked(self, user):
        """Check if a user has liked this post"""
        if not user or not user.is_authenticated:
            return False
        return self.likes.filter(user=user).exists()

class ForumPostLike(models.Model):
    post = models.ForeignKey(ForumPost, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('post', 'user')
    
    def __str__(self):
        return f"{self.user.username} likes post #{self.post.id}"

class KnowledgeArticle(models.Model):
    ARTICLE_TYPES = (
        ('GUIDE', 'How-to Guide'),
        ('FAQ', 'Frequently Asked Questions'),
        ('TIPS', 'Tips & Tricks'),
        ('EXPERIENCE', 'Personal Experience'),
        ('RESOURCE', 'Resource Collection'),
    )
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    article_type = models.CharField(max_length=20, choices=ARTICLE_TYPES)
    content = models.TextField()
    summary = models.TextField()
    tags = models.JSONField(default=list)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    view_count = models.IntegerField(default=0)
    helpful_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_featured', '-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

class ArticleHelpfulVote(models.Model):
    article = models.ForeignKey(KnowledgeArticle, on_delete=models.CASCADE, related_name='helpful_votes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_helpful = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('article', 'user')
    
    def __str__(self):
        return f"{self.user.username} - {self.article.title} ({'Helpful' if self.is_helpful else 'Not Helpful'})"
