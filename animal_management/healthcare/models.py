from django.db import models
from django.conf import settings
from animals.models import Animal
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

class VaccinationRecord(models.Model):
    VACCINE_TYPES = (
        ('RABIES', 'Rabies'),
        ('DISTEMPER', 'Distemper'),
        ('PARVOVIRUS', 'Parvovirus'),
        ('HEPATITIS', 'Hepatitis'),
        ('LEPTOSPIROSIS', 'Leptospirosis'),
        ('BORDETELLA', 'Bordetella'),
        ('LYME', 'Lyme Disease'),
        ('FVRCP', 'FVRCP (Cats)'),
        ('FELV', 'Feline Leukemia'),
        ('OTHER', 'Other'),
    )
    
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='vaccinations')
    vaccine_type = models.CharField(max_length=20, choices=VACCINE_TYPES)
    vaccine_name = models.CharField(max_length=100, blank=True, null=True)
    date_administered = models.DateField()
    next_due_date = models.DateField(blank=True, null=True)
    veterinarian = models.CharField(max_length=100)
    clinic_name = models.CharField(max_length=100, blank=True, null=True)
    batch_number = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    # NEW: Inventory integration fields
    inventory_item = models.ForeignKey(
        'inventory.InventoryItem', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        help_text="Vaccine item from inventory"
    )
    quantity_used = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=1.0,
        help_text="Amount of vaccine used (typically 1 dose)"
    )
    inventory_consumed = models.BooleanField(
        default=False,
        help_text="Whether inventory has been automatically reduced"
    )
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.vaccine_type} for {self.animal.name or 'Unnamed'} on {self.date_administered}"
    
    class Meta:
        ordering = ['-date_administered']

class MedicalRecord(models.Model):
    RECORD_TYPES = (
        ('CHECKUP', 'Regular Checkup'),
        ('TREATMENT', 'Treatment'),
        ('SURGERY', 'Surgery'),
        ('EMERGENCY', 'Emergency'),
        ('FOLLOW_UP', 'Follow-up'),
        ('OTHER', 'Other'),
    )
    
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='medical_records')
    record_type = models.CharField(max_length=20, choices=RECORD_TYPES)
    date = models.DateField()
    veterinarian = models.CharField(max_length=100)
    clinic_name = models.CharField(max_length=100, blank=True, null=True)
    reason = models.CharField(max_length=200)
    diagnosis = models.TextField(blank=True, null=True)
    treatment = models.TextField(blank=True, null=True)
    medications = models.TextField(blank=True, null=True)
    follow_up_required = models.BooleanField(default=False)
    follow_up_date = models.DateField(blank=True, null=True)
    attachments = models.JSONField(blank=True, null=True)  # For storing file URLs
    
    # NEW: Medical supplies tracking
    medical_supplies_used = models.ManyToManyField(
        'inventory.InventoryItem',
        through='MedicalSupplyUsage',
        blank=True,
        help_text="Medical supplies consumed during treatment"
    )
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.record_type} for {self.animal.name or 'Unnamed'} on {self.date}"
    
    class Meta:
        ordering = ['-date']

# NEW: Model to track medical supply usage
class MedicalSupplyUsage(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE)
    inventory_item = models.ForeignKey('inventory.InventoryItem', on_delete=models.CASCADE)
    quantity_used = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
    inventory_consumed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.quantity_used} {self.inventory_item.unit} of {self.inventory_item.name}"
    
    class Meta:
        unique_together = ['medical_record', 'inventory_item']

class HealthStatus(models.Model):
    STATUS_CHOICES = (
        ('HEALTHY', 'Healthy'),
        ('SICK', 'Sick'),
        ('INJURED', 'Injured'),
        ('RECOVERING', 'Recovering'),
        ('CRITICAL', 'Critical'),
        ('QUARANTINE', 'In Quarantine'),
    )
    
    animal = models.OneToOneField(Animal, on_delete=models.CASCADE, related_name='health_status_record')
    current_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='HEALTHY')
    last_checkup_date = models.DateField(blank=True, null=True)
    next_checkup_date = models.DateField(blank=True, null=True)
    weight = models.FloatField(blank=True, null=True)
    temperature = models.FloatField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Health Status for {self.animal.name or 'Unnamed'}: {self.current_status}"
    
    class Meta:
        verbose_name_plural = "Health statuses"

# Signal to automatically consume inventory when vaccination is recorded
@receiver(post_save, sender=VaccinationRecord)
def consume_vaccine_inventory(sender, instance, created, **kwargs):
    """Automatically reduce inventory when vaccination is recorded"""
    if created and instance.inventory_item and not instance.inventory_consumed:
        try:
            # Import here to avoid circular imports
            from inventory.models import InventoryTransaction
            
            # Check if enough inventory is available
            if instance.inventory_item.quantity >= instance.quantity_used:
                # Create inventory transaction
                InventoryTransaction.objects.create(
                    item=instance.inventory_item,
                    transaction_type='MEDICAL_USE',
                    quantity=instance.quantity_used,
                    notes=f"Vaccination: {instance.vaccine_type} for {instance.animal.name or 'Unnamed'}",
                    related_animal=instance.animal,
                    related_health_record=instance,
                    created_by=instance.created_by
                )
                
                # Update inventory quantity
                instance.inventory_item.quantity -= instance.quantity_used
                instance.inventory_item.save()
                
                # Mark as consumed
                instance.inventory_consumed = True
                instance.save(update_fields=['inventory_consumed'])
                
                print(f"Consumed {instance.quantity_used} {instance.inventory_item.unit} of {instance.inventory_item.name}")
            else:
                print(f"Warning: Insufficient inventory for {instance.inventory_item.name}")
        except Exception as e:
            print(f"Error consuming vaccine inventory: {e}")

# Signal to consume medical supplies when medical record is saved
@receiver(post_save, sender=MedicalSupplyUsage)
def consume_medical_supply_inventory(sender, instance, created, **kwargs):
    """Automatically reduce inventory when medical supply usage is recorded"""
    if created and not instance.inventory_consumed:
        try:
            # Import here to avoid circular imports
            from inventory.models import InventoryTransaction
            
            # Check if enough inventory is available
            if instance.inventory_item.quantity >= instance.quantity_used:
                # Create inventory transaction
                InventoryTransaction.objects.create(
                    item=instance.inventory_item,
                    transaction_type='MEDICAL_USE',
                    quantity=instance.quantity_used,
                    notes=f"Medical treatment for {instance.medical_record.animal.name or 'Unnamed'}",
                    related_animal=instance.medical_record.animal,
                    created_by=instance.medical_record.created_by
                )
                
                # Update inventory quantity
                instance.inventory_item.quantity -= instance.quantity_used
                instance.inventory_item.save()
                
                # Mark as consumed
                instance.inventory_consumed = True
                instance.save(update_fields=['inventory_consumed'])
                
                print(f"Consumed {instance.quantity_used} {instance.inventory_item.unit} of {instance.inventory_item.name}")
            else:
                print(f"Warning: Insufficient inventory for {instance.inventory_item.name}")
        except Exception as e:
            print(f"Error consuming medical supply inventory: {e}")
