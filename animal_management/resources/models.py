from django.db import models
from django.conf import settings
from django.utils.text import slugify

class ResourceCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, default='article')  # Material UI icon name
    order = models.IntegerField(default=0)
    
    class Meta:
        verbose_name_plural = 'Resource Categories'
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class EducationalResource(models.Model):
    RESOURCE_TYPES = (
        ('ARTICLE', 'Article'),
        ('GUIDE', 'Guide'),
        ('VIDEO', 'Video'),
        ('INFOGRAPHIC', 'Infographic'),
        ('CHECKLIST', 'Checklist'),
        ('FAQ', 'Frequently Asked Questions'),
    )
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    category = models.ForeignKey(ResourceCategory, on_delete=models.CASCADE, related_name='resources')
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    content = models.TextField()
    summary = models.TextField()
    featured_image = models.URLField(blank=True, null=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    is_published = models.BooleanField(default=True)
    view_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class ResourceRating(models.Model):
    resource = models.ForeignKey(EducationalResource, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5')])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('resource', 'user')
    
    def __str__(self):
        return f"{self.user.username} - {self.resource.title} ({self.rating})"

# Add these new models to the END of your resources/models.py file

class InteractiveLearningModule(models.Model):
    """
    Interactive components for educational resources
    Think: quizzes, interactive videos, step-by-step guides
    """
    MODULE_TYPES = (
        ('QUIZ', 'Interactive Quiz'),
        ('VIDEO', 'Interactive Video'),
        ('CHECKLIST', 'Interactive Checklist'),
        ('SIMULATION', 'Virtual Simulation'),
        ('PROGRESS_TRACKER', 'Progress Tracker'),
    )
    
    resource = models.OneToOneField(
        EducationalResource, 
        on_delete=models.CASCADE, 
        related_name='interactive_module'
    )
    module_type = models.CharField(max_length=20, choices=MODULE_TYPES)
    is_active = models.BooleanField(default=True)
    
    # Interactive content stored as JSON
    # This will hold quiz questions, video timestamps, checklist items, etc.
    content_data = models.JSONField(default=dict, help_text="Interactive content structure")
    
    # Settings
    requires_completion = models.BooleanField(default=False)
    passing_score = models.IntegerField(default=70, help_text="Minimum score to pass (for quizzes)")
    estimated_duration = models.IntegerField(default=10, help_text="Estimated minutes to complete")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.resource.title} - {self.get_module_type_display()}"


class LearningProgress(models.Model):
    """
    Track individual user progress through interactive learning modules
    """
    STATUS_CHOICES = (
        ('NOT_STARTED', 'Not Started'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('PASSED', 'Passed'),
        ('FAILED', 'Failed'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    module = models.ForeignKey(InteractiveLearningModule, on_delete=models.CASCADE)
    
    # Progress tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NOT_STARTED')
    completion_percentage = models.IntegerField(default=0)
    current_step = models.IntegerField(default=0)
    
    # Quiz/Assessment results
    latest_score = models.IntegerField(null=True, blank=True, help_text="Latest quiz score percentage")
    best_score = models.IntegerField(null=True, blank=True, help_text="Best quiz score achieved")
    attempts_count = models.IntegerField(default=0)
    
    # Detailed progress data (what questions answered, video timestamps watched, etc.)
    progress_data = models.JSONField(default=dict)
    
    # Timing
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed = models.DateTimeField(auto_now=True)
    
    # Time spent
    total_time_spent = models.IntegerField(default=0, help_text="Total minutes spent")
    
    class Meta:
        unique_together = ('user', 'module')
    
    def __str__(self):
        return f"{self.user.username} - {self.module.resource.title} ({self.status})"
    
    @property
    def is_passed(self):
        """Check if user passed the module"""
        if self.module.module_type == 'QUIZ':
            return self.best_score and self.best_score >= self.module.passing_score
        return self.status == 'COMPLETED'


class QuizQuestion(models.Model):
    """
    Individual quiz questions for interactive learning modules
    """
    QUESTION_TYPES = (
        ('MULTIPLE_CHOICE', 'Multiple Choice'),
        ('TRUE_FALSE', 'True/False'),
        ('FILL_BLANK', 'Fill in the Blank'),
        ('MATCHING', 'Matching'),
    )
    
    module = models.ForeignKey(
        InteractiveLearningModule, 
        on_delete=models.CASCADE, 
        related_name='quiz_questions'
    )
    
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    order = models.IntegerField(default=0)
    
    # Store question options and correct answers as JSON
    # For multiple choice: {"options": ["A", "B", "C"], "correct": 0}
    # For true/false: {"correct": true}
    # For fill blank: {"correct": "answer"}
    question_data = models.JSONField(default=dict)
    
    explanation = models.TextField(blank=True, help_text="Explanation shown after answering")
    points = models.IntegerField(default=1)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}..."


class UserQuizAttempt(models.Model):
    """
    Record each quiz attempt by users
    """
    progress = models.ForeignKey(LearningProgress, on_delete=models.CASCADE, related_name='quiz_attempts')
    
    # Results
    score_percentage = models.IntegerField()
    correct_answers = models.IntegerField()
    total_questions = models.IntegerField()
    
    # Detailed answers for review
    answers_data = models.JSONField(default=dict, help_text="User's answers to each question")
    
    # Timing
    started_at = models.DateTimeField()
    completed_at = models.DateTimeField()
    time_spent_minutes = models.IntegerField()
    
    def __str__(self):
        return f"{self.progress.user.username} - Attempt {self.id} - {self.score_percentage}%"
