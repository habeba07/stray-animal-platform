from django.db import models
from django.conf import settings
from animals.models import Animal
from django.utils import timezone

class VirtualAdoption(models.Model):
    SUBSCRIPTION_PERIODS = (
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('ANNUALLY', 'Annually'),
    )
    
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('PAUSED', 'Paused'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
    )
    
    sponsor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='virtual_adoptions')
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='virtual_adoptions')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    period = models.CharField(max_length=10, choices=SUBSCRIPTION_PERIODS, default='MONTHLY')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    
    start_date = models.DateField(default=timezone.now)
    next_payment_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    is_gift = models.BooleanField(default=False)
    gift_recipient_name = models.CharField(max_length=255, null=True, blank=True)
    gift_recipient_email = models.EmailField(null=True, blank=True)
    gift_message = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.sponsor.username} - {self.animal.name or 'Unnamed'}"
    
    def save(self, *args, **kwargs):
        # Set next payment date if not set
        if not self.next_payment_date:
            self.next_payment_date = self.calculate_next_payment_date()
        
        super().save(*args, **kwargs)
    
    def calculate_next_payment_date(self):
        today = timezone.now().date()
        
        if self.period == 'MONTHLY':
            next_date = today.replace(day=1) + timezone.timedelta(days=32)
            return next_date.replace(day=1)
        elif self.period == 'QUARTERLY':
            next_month = today.month + 3
            next_year = today.year + (next_month > 12)
            next_month = (next_month - 1) % 12 + 1
            return today.replace(year=next_year, month=next_month, day=1)
        elif self.period == 'ANNUALLY':
            return today.replace(year=today.year + 1)
        
        return today


class VirtualAdoptionUpdate(models.Model):
    virtual_adoption = models.ForeignKey(VirtualAdoption, on_delete=models.CASCADE, related_name='updates')
    title = models.CharField(max_length=255)
    content = models.TextField()
    photo = models.URLField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Update for {self.virtual_adoption}"


class VirtualAdoptionLevel(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    benefits = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} (${self.amount})"
