from django.db import models
from django.conf import settings
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from notifications.services import create_notification

class ItemCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name_plural = 'Item Categories'
    
    def __str__(self):
        return self.name

class InventoryItem(models.Model):
    UNIT_CHOICES = (
        ('UNIT', 'Unit'),
        ('KG', 'Kilogram'),
        ('G', 'Gram'),
        ('L', 'Liter'),
        ('ML', 'Milliliter'),
        ('BOX', 'Box'),
        ('PACKET', 'Packet'),
        ('DOSE', 'Dose'),  # Added for medical items
    )
    
    ITEM_TYPES = (
        ('MEDICAL', 'Medical/Vaccine'),
        ('FOOD', 'Food'),
        ('SUPPLY', 'General Supply'),
        ('EQUIPMENT', 'Equipment'),
    )
    
    name = models.CharField(max_length=100)
    category = models.ForeignKey(ItemCategory, on_delete=models.CASCADE, related_name='items')
    item_type = models.CharField(max_length=10, choices=ITEM_TYPES, default='SUPPLY')
    description = models.TextField(blank=True, null=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='UNIT')
    minimum_threshold = models.DecimalField(max_digits=10, decimal_places=2, help_text="Minimum quantity before alert is triggered")
    
    # FIXED: Make cost_per_unit required for proper financial tracking
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, help_text="Required for budget tracking")
    
    expiry_date = models.DateField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True, help_text="Storage location")
    
    # NEW: Medical safety tracking
    batch_number = models.CharField(max_length=50, blank=True, null=True, help_text="For medical items and recalls")
    requires_refrigeration = models.BooleanField(default=False)
    
    # NEW: Procurement tracking
    on_order_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_ordered_date = models.DateField(blank=True, null=True)
    preferred_supplier = models.ForeignKey('Supplier', on_delete=models.SET_NULL, null=True, blank=True)
    
    image = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.quantity} {self.unit})"
    
    @property
    def is_low_on_stock(self):
        return self.quantity <= self.minimum_threshold
    
    @property
    def is_expired(self):
        if self.expiry_date:
            return self.expiry_date <= timezone.now().date()
        return False
    
    @property
    def is_expiring_soon(self):
        """FIXED: Better expiring logic based on item type"""
        if not self.expiry_date:
            return False
        
        days_until_expiry = (self.expiry_date - timezone.now().date()).days
        
        # Different thresholds based on item type
        if self.item_type == 'MEDICAL':
            return 0 <= days_until_expiry <= 30  # 30 days for medical
        else:
            return 0 <= days_until_expiry <= 7   # 7 days for food/supplies
    
    @property
    def days_until_expiry(self):
        if self.expiry_date:
            delta = self.expiry_date - timezone.now().date()
            return delta.days
        return None
    
    @property
    def status_display(self):
        """FIXED: Better status logic"""
        if self.is_expired:
            return 'EXPIRED'
        elif self.is_expiring_soon:
            return 'EXPIRES_SOON'
        elif self.is_low_on_stock:
            return 'LOW_STOCK'
        elif self.on_order_quantity > 0:
            return 'ON_ORDER'
        else:
            return 'IN_STOCK'
    
    @property
    def total_available(self):
        """Current + on order quantity"""
        return self.quantity + self.on_order_quantity

class InventoryTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('STOCK_IN', 'Stock In'),
        ('STOCK_OUT', 'Stock Out'),
        ('ADJUSTMENT', 'Adjustment'),
        ('MEDICAL_USE', 'Medical Use'),  # NEW: For health record integration
        ('EXPIRED_DISPOSAL', 'Expired Disposal'),  # NEW: For expired items
    )
    
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_date = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True, null=True)
    
    # NEW: Link to health records for consumption tracking
    related_animal = models.ForeignKey('animals.Animal', on_delete=models.SET_NULL, null=True, blank=True)
    related_health_record = models.ForeignKey('healthcare.VaccinationRecord', on_delete=models.SET_NULL, null=True, blank=True)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.transaction_type} - {self.item.name} ({self.quantity} {self.item.unit})"

class Supplier(models.Model):
    name = models.CharField(max_length=100)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    
    # NEW: Procurement integration
    is_preferred = models.BooleanField(default=False)
    average_delivery_days = models.IntegerField(default=7)
    
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class Purchase(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ORDERED', 'Ordered'),
        ('RECEIVED', 'Received'),
        ('CANCELLED', 'Cancelled'),
    )
    
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchases')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    order_date = models.DateField()
    expected_delivery_date = models.DateField(blank=True, null=True)
    delivery_date = models.DateField(blank=True, null=True)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    invoice_number = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Purchase from {self.supplier.name} ({self.order_date})"

class PurchaseItem(models.Model):
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, related_name='items')
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.item.name} - {self.quantity} {self.item.unit}"
    
    @property
    def total_price(self):
        return self.quantity * self.unit_price

# NEW: Audit Trail Model
class InventoryAuditLog(models.Model):
    ACTION_TYPES = (
        ('CREATE', 'Created'),
        ('UPDATE', 'Updated'),
        ('DELETE', 'Deleted'),
        ('STOCK_CHANGE', 'Stock Changed'),
    )
    
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='audit_logs')
    action = models.CharField(max_length=20, choices=ACTION_TYPES)
    field_changed = models.CharField(max_length=100, blank=True, null=True)
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.action} - {self.item.name} by {self.user}"

# Signal to notify staff when inventory is low
@receiver(post_save, sender=InventoryItem)
def notify_low_inventory(sender, instance, **kwargs):
    if instance.is_low_on_stock:
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            staff_users = User.objects.filter(user_type__in=['STAFF', 'SHELTER'])
            
            for user in staff_users:
                create_notification(
                    recipient=user,
                    notification_type='SYSTEM_MESSAGE',
                    title='Low Inventory Alert',
                    message=f'{instance.name} is running low. Current quantity: {instance.quantity} {instance.unit}',
                    related_object=instance
                )
        except Exception as e:
            print(f"Error sending low inventory notification: {e}")

# Signal to notify staff when items are expiring soon
@receiver(post_save, sender=InventoryItem)
def notify_expiring_items(sender, instance, **kwargs):
    if instance.is_expiring_soon:
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            staff_users = User.objects.filter(user_type__in=['STAFF', 'SHELTER'])
            
            days_remaining = instance.days_until_expiry
            for user in staff_users:
                create_notification(
                    recipient=user,
                    notification_type='SYSTEM_MESSAGE',
                    title='Expiring Inventory Alert',
                    message=f'{instance.name} is expiring in {days_remaining} days (on {instance.expiry_date})',
                    related_object=instance
                )
        except Exception as e:
            print(f"Error sending expiry notification: {e}")