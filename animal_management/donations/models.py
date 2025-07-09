from django.db import models
from django.conf import settings
from animals.models import Animal
from django.utils import timezone
from decimal import Decimal

class DonationCampaign(models.Model):
    CAMPAIGN_TYPES = (
        ('GENERAL', 'General Fund'),
        ('MEDICAL', 'Medical Care'),
        ('RESCUE', 'Rescue Operations'),
        ('SHELTER', 'Shelter Maintenance'),
        ('SPECIFIC_ANIMAL', 'Specific Animal Care'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    campaign_type = models.CharField(max_length=20, choices=CAMPAIGN_TYPES)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    animal = models.ForeignKey(Animal, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    @property
    def progress_percentage(self):
        if self.target_amount > 0:
            return int((self.current_amount / self.target_amount) * 100)
        return 0


class Donation(models.Model):
    PAYMENT_METHODS = (
        ('CREDIT_CARD', 'Credit Card'),
        ('DEBIT_CARD', 'Debit Card'),
        ('PAYPAL', 'PayPal'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('CASH', 'Cash'),
    )
    
    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    campaign = models.ForeignKey(DonationCampaign, on_delete=models.CASCADE, related_name='donations', null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Add these fields for better tracking
    donor_name = models.CharField(max_length=200, blank=True)  # For anonymous donations or non-user donors
    donor_email = models.EmailField(blank=True)
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='CREDIT_CARD')
    transaction_id = models.CharField(max_length=100, unique=True, blank=True)
    is_anonymous = models.BooleanField(default=False)
    message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Auto-populate donor_name if not provided
        if not self.donor_name and self.donor:
            self.donor_name = f"{self.donor.first_name} {self.donor.last_name}".strip() or self.donor.username
        
        # Generate transaction_id if not provided
        if not self.transaction_id:
            import uuid
            self.transaction_id = str(uuid.uuid4())[:12].upper()
        
        super().save(*args, **kwargs)
    
    def calculate_impact(self):
        """Calculate and create impact records for this donation"""
        # This would be called after a donation is processed
        # Automatically allocate donation to different impact categories
        pass
    
    def get_impact_breakdown(self):
        """Return breakdown of how this donation was used"""
        return self.impacts.select_related('impact_category').all()
    
    def get_animals_helped(self):
        """Return all animals helped by this donation"""
        animal_ids = []
        for impact in self.impacts.all():
            animal_ids.extend(impact.animals_helped.values_list('id', flat=True))
        return list(set(animal_ids))  # Remove duplicates
    
    def __str__(self):
        donor_name = "Anonymous" if self.is_anonymous else (self.donor_name or "Unknown Donor")
        return f"{donor_name} - ${self.amount}"

class ImpactCategory(models.Model):
    """Categories for tracking different types of impact"""
    IMPACT_TYPES = (
        ('MEDICAL', 'Medical Treatment'),
        ('FOOD', 'Food & Nutrition'),
        ('SHELTER', 'Shelter & Housing'),
        ('RESCUE', 'Rescue Operations'),
        ('ADOPTION', 'Adoption Services'),
        ('EDUCATION', 'Community Education'),
        ('EMERGENCY', 'Emergency Response'),
    )
    
    name = models.CharField(max_length=100)
    category_type = models.CharField(max_length=20, choices=IMPACT_TYPES)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='favorite')  # Material UI icon
    color = models.CharField(max_length=7, default='#1976d2')  # Hex color
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2)  # Cost per animal helped
    unit_name = models.CharField(max_length=50, default='animal')  # e.g., "animal", "meal", "vaccination"
    
    class Meta:
        verbose_name_plural = 'Impact Categories'
    
    def __str__(self):
        return f"{self.name} (${self.cost_per_unit} per {self.unit_name})"


class DonationImpact(models.Model):
    """Track the specific impact of donations"""
    donation = models.ForeignKey('Donation', on_delete=models.CASCADE, related_name='impacts')
    impact_category = models.ForeignKey(ImpactCategory, on_delete=models.CASCADE)
    amount_allocated = models.DecimalField(max_digits=10, decimal_places=2)
    units_helped = models.IntegerField()  # Number of animals/meals/etc helped
    description = models.TextField(blank=True)
    date_achieved = models.DateTimeField(default=timezone.now)
    
    # Optional: Link to specific animals helped
    animals_helped = models.ManyToManyField('animals.Animal', blank=True)
    
    def __str__(self):
        return f"{self.donation.donor_name} - {self.impact_category.name}: {self.units_helped} {self.impact_category.unit_name}s"


class SuccessStory(models.Model):
    """Before/after success stories linked to donations"""
    title = models.CharField(max_length=200)
    animal = models.ForeignKey('animals.Animal', on_delete=models.CASCADE, related_name='success_stories')
    story_text = models.TextField()
    
    # Before/After photos
    before_photo = models.URLField(blank=True, null=True)
    after_photo = models.URLField(blank=True, null=True)
    
    # Link to donations that made this possible
    enabled_by_donations = models.ManyToManyField('Donation', blank=True)
    
    # Impact metrics
    rescue_date = models.DateTimeField()
    adoption_date = models.DateTimeField(blank=True, null=True)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    days_in_care = models.IntegerField(blank=True, null=True)
    
    # Story metadata  
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Success Stories'
    
    def __str__(self):
        return f"Success Story: {self.title}"
    
    @property
    def days_to_adoption(self):
        if self.adoption_date:
            return (self.adoption_date - self.rescue_date).days
        return None


class ImpactMetrics(models.Model):
    """Monthly/yearly impact summary metrics"""
    period_start = models.DateField()
    period_end = models.DateField()
    period_type = models.CharField(max_length=20, choices=[
        ('MONTH', 'Monthly'),
        ('QUARTER', 'Quarterly'), 
        ('YEAR', 'Yearly')
    ])
    
    # Financial metrics
    total_donations = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Impact metrics
    animals_rescued = models.IntegerField(default=0)
    animals_adopted = models.IntegerField(default=0)
    medical_treatments = models.IntegerField(default=0)
    meals_provided = models.IntegerField(default=0)
    volunteers_engaged = models.IntegerField(default=0)
    
    # Efficiency metrics
    average_cost_per_rescue = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    average_days_to_adoption = models.IntegerField(default=0)
    adoption_success_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # Percentage
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-period_start']
        unique_together = ['period_start', 'period_type']
    
    def __str__(self):
        return f"{self.period_type} Impact: {self.period_start} to {self.period_end}"


class DonorImpactSummary(models.Model):
    """Personal impact summary for individual donors"""
    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='impact_summary')
    
    # Lifetime totals
    total_donated = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    animals_helped = models.IntegerField(default=0)
    first_donation_date = models.DateTimeField(blank=True, null=True)
    last_donation_date = models.DateTimeField(blank=True, null=True)
    
    # Recognition levels
    DONOR_LEVELS = (
        ('BRONZE', 'Bronze Helper ($1-$100)'),
        ('SILVER', 'Silver Supporter ($101-$500)'),
        ('GOLD', 'Gold Champion ($501-$2000)'),
        ('PLATINUM', 'Platinum Hero ($2001-$5000)'),
        ('DIAMOND', 'Diamond Legend ($5000+)'),
    )
    donor_level = models.CharField(max_length=20, choices=DONOR_LEVELS, default='BRONZE')
    
    # Engagement metrics
    donations_count = models.IntegerField(default=0)
    favorite_cause = models.ForeignKey(ImpactCategory, on_delete=models.SET_NULL, null=True, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Donor Impact Summaries'
    
    def __str__(self):
        return f"{self.donor.username} - {self.donor_level} (${self.total_donated})"
    
    def update_donor_level(self):
        """Update donor level based on total donated"""
        if self.total_donated >= 5000:
            self.donor_level = 'DIAMOND'
        elif self.total_donated >= 2001:
            self.donor_level = 'PLATINUM' 
        elif self.total_donated >= 501:
            self.donor_level = 'GOLD'
        elif self.total_donated >= 101:
            self.donor_level = 'SILVER'
        else:
            self.donor_level = 'BRONZE'
        self.save()

class RecurringDonation(models.Model):
    """Model for managing recurring donations/subscriptions"""
    
    FREQUENCY_CHOICES = [
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly (every 3 months)'),
        ('ANNUALLY', 'Annually'),
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('PAUSED', 'Paused'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
    ]
    
    # Basic info
    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recurring_donations')
    campaign = models.ForeignKey(DonationCampaign, on_delete=models.SET_NULL, null=True, blank=True, related_name='recurring_donations')
    
    # Donation details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    payment_method = models.CharField(max_length=20, choices=Donation.PAYMENT_METHODS, default='CREDIT_CARD')
    
    # Subscription management
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    start_date = models.DateTimeField(default=timezone.now)
    next_payment_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)  # Optional end date
    
    # Tracking
    total_donated = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    successful_payments = models.IntegerField(default=0)
    failed_payments = models.IntegerField(default=0)
    last_payment_date = models.DateTimeField(null=True, blank=True)
    
    # Optional fields
    is_anonymous = models.BooleanField(default=False)
    message = models.TextField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'next_payment_date']),
            models.Index(fields=['donor', 'status']),
        ]
    
    def __str__(self):
        return f"{self.donor.username} - ${self.amount} {self.frequency} - {self.status}"
    
    def calculate_next_payment_date(self):
        """Calculate the next payment date based on frequency"""
        from dateutil.relativedelta import relativedelta
        
        base_date = self.last_payment_date or self.start_date
        
        if self.frequency == 'WEEKLY':
            return base_date + timedelta(weeks=1)
        elif self.frequency == 'MONTHLY':
            return base_date + relativedelta(months=1)
        elif self.frequency == 'QUARTERLY':
            return base_date + relativedelta(months=3)
        elif self.frequency == 'ANNUALLY':
            return base_date + relativedelta(years=1)
        
        return base_date
    
    def is_due_for_payment(self):
        """Check if this recurring donation is due for payment"""
        if self.status != 'ACTIVE':
            return False
        
        if self.end_date and timezone.now() > self.end_date:
            return False
            
        return timezone.now() >= self.next_payment_date
    
    def process_payment(self):
        """Process a recurring payment and create a new Donation record"""
        if not self.is_due_for_payment():
            return False
        
        try:
            # Create new donation record
            donation = Donation.objects.create(
                donor=self.donor,
                campaign=self.campaign,
                amount=self.amount,
                payment_method=self.payment_method,
                is_anonymous=self.is_anonymous,
                message=f"Recurring donation: {self.message}" if self.message else "Recurring donation"
            )

            from .views import create_donation_impact
            create_donation_impact(donation)
            
            # Update campaign total if campaign exists
            if self.campaign:
                self.campaign.current_amount += self.amount
                self.campaign.save()
            
            # Update recurring donation tracking
            self.successful_payments += 1
            self.total_donated += self.amount
            self.last_payment_date = timezone.now()
            self.next_payment_date = self.calculate_next_payment_date()

            from .views import update_donor_summary
            update_donor_summary(self.donor)
            
            # Check if subscription should end
            if self.end_date and self.next_payment_date > self.end_date:
                self.status = 'EXPIRED'
            
            self.save()
            
            # Send receipt email
            from .email_utils import send_donation_receipt, send_donation_notification_to_staff, send_campaign_milestone_notification
            send_donation_receipt(donation)
            send_donation_notification_to_staff(donation)
            if self.campaign:
                send_campaign_milestone_notification(self.campaign)
            
            return True
            
        except Exception as e:
            # Log error and update failed payment count
            self.failed_payments += 1
            
            # If too many failed payments, pause the subscription
            if self.failed_payments >= 3:
                self.status = 'PAUSED'
            
            self.save()
            return False
    
    def cancel(self):
        """Cancel the recurring donation"""
        self.status = 'CANCELLED'
        self.save()
    
    def pause(self):
        """Pause the recurring donation"""
        self.status = 'PAUSED'
        self.save()
    
    def resume(self):
        """Resume a paused recurring donation"""
        if self.status == 'PAUSED':
            self.status = 'ACTIVE'
            # Reset next payment date to today + frequency
            self.next_payment_date = self.calculate_next_payment_date()
            self.save()

