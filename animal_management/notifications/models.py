from django.db import models
from django.conf import settings

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('REPORT_UPDATE', 'Report Status Update'),
        ('ADOPTION_UPDATE', 'Adoption Application Update'),
        ('VOLUNTEER_ASSIGNMENT', 'Volunteer Assignment'),
        ('DONATION_RECEIVED', 'Donation Received'),
        ('ANIMAL_UPDATE', 'Animal Status Update'),
        ('SYSTEM_MESSAGE', 'System Message'),
    )

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=100)
    message = models.TextField()
    related_object_id = models.IntegerField(blank=True, null=True)  # ID of report, adoption, etc.
    related_object_type = models.CharField(max_length=50, blank=True, null=True)  # 'report', 'adoption', etc.
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.recipient.username}"
