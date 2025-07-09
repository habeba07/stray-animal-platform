from django.db import models
from django.conf import settings
from django.utils.text import slugify

class ResourceCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='sentiment_satisfied')  # Material UI icon name
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Resource categories'
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name

class MentalHealthResource(models.Model):
    RESOURCE_TYPES = (
        ('ARTICLE', 'Article'),
        ('VIDEO', 'Video'),
        ('AUDIO', 'Audio/Podcast'),
        ('EXERCISE', 'Exercise/Activity'),
        ('ASSESSMENT', 'Self-Assessment'),
        ('CONTACT', 'Contact Information'),
    )
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    category = models.ForeignKey(ResourceCategory, on_delete=models.CASCADE, related_name='resources')
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    content = models.TextField()
    summary = models.TextField()
    external_url = models.URLField(blank=True, null=True)
    featured_image = models.URLField(blank=True, null=True)
    author = models.CharField(max_length=100, blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_featured', '-created_at']
        
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

class SelfCareReminder(models.Model):
    FREQUENCY_CHOICES = (
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='care_reminders')
    title = models.CharField(max_length=100)
    message = models.TextField()
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES)
    time_of_day = models.TimeField()
    is_active = models.BooleanField(default=True)
    last_sent = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"

class StressLogEntry(models.Model):
    STRESS_LEVELS = (
        (1, 'Very Low'),
        (2, 'Low'),
        (3, 'Moderate'),
        (4, 'High'),
        (5, 'Very High'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='stress_logs')
    date = models.DateField()
    stress_level = models.IntegerField(choices=STRESS_LEVELS)
    notes = models.TextField(blank=True, null=True)
    factors = models.JSONField(default=list)  # List of stress factors
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
        verbose_name_plural = 'Stress log entries'
        
    def __str__(self):
        return f"{self.user.username} - {self.date} - Level {self.stress_level}"
