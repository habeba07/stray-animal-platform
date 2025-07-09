from rest_framework import serializers
from django.db import models
from .models import (
    ItemCategory,
    InventoryItem,
    InventoryTransaction,
    Supplier,
    Purchase,
    PurchaseItem,
    InventoryAuditLog
)
from users.serializers import UserSerializer

class ItemCategorySerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ItemCategory
        fields = ['id', 'name', 'description', 'items_count']
    
    def get_items_count(self, obj):
        return obj.items.count()

class SupplierSerializer(serializers.ModelSerializer):
    purchases_count = serializers.SerializerMethodField()
    total_purchase_value = serializers.SerializerMethodField()
    
    class Meta:
        model = Supplier
        fields = '__all__'
        extra_fields = ['purchases_count', 'total_purchase_value']
    
    def get_purchases_count(self, obj):
        return obj.purchases.count()
    
    def get_total_purchase_value(self, obj):
        return obj.purchases.filter(status='RECEIVED').aggregate(
            total=models.Sum('total_cost')
        )['total'] or 0

class InventoryItemSerializer(serializers.ModelSerializer):
    category_details = ItemCategorySerializer(source='category', read_only=True)
    preferred_supplier_details = SupplierSerializer(source='preferred_supplier', read_only=True)
    
    # FIXED: Enhanced computed fields
    is_low_on_stock = serializers.BooleanField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    is_expiring_soon = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)
    status_display = serializers.CharField(read_only=True)
    total_available = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    # NEW: Financial and analytics fields
    total_value = serializers.SerializerMethodField()
    consumption_rate = serializers.SerializerMethodField()
    last_transaction_date = serializers.SerializerMethodField()
    
    class Meta:
        model = InventoryItem
        fields = [
            'id', 'name', 'category', 'category_details', 'item_type', 'description', 
            'quantity', 'unit', 'minimum_threshold', 'cost_per_unit', 'expiry_date', 
            'location', 'batch_number', 'requires_refrigeration', 'on_order_quantity',
            'last_ordered_date', 'preferred_supplier', 'preferred_supplier_details',
            'image', 'is_low_on_stock', 'is_expired', 'is_expiring_soon', 
            'days_until_expiry', 'status_display', 'total_available', 'total_value',
            'consumption_rate', 'last_transaction_date', 'created_at', 'updated_at'
        ]
    
    def get_total_value(self, obj):
        return obj.quantity * obj.cost_per_unit if obj.cost_per_unit else 0
    
    def get_consumption_rate(self, obj):
        # Get 30-day consumption rate
        from datetime import timedelta
        from django.utils import timezone
        from django.db.models import Sum
        
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        consumption = obj.transactions.filter(
            transaction_type__in=['STOCK_OUT', 'MEDICAL_USE', 'EXPIRED_DISPOSAL'],
            transaction_date__gte=start_date
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        return consumption / 30  # Daily rate
    
    def get_last_transaction_date(self, obj):
        last_transaction = obj.transactions.order_by('-transaction_date').first()
        return last_transaction.transaction_date if last_transaction else None

class InventoryTransactionSerializer(serializers.ModelSerializer):
    item_details = InventoryItemSerializer(source='item', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    # NEW: Related records for health integration
    related_animal_name = serializers.SerializerMethodField()
    related_health_record_details = serializers.SerializerMethodField()
    
    class Meta:
        model = InventoryTransaction
        fields = [
            'id', 'item', 'item_details', 'transaction_type', 'quantity',
            'transaction_date', 'notes', 'related_animal', 'related_animal_name',
            'related_health_record', 'related_health_record_details', 
            'created_by', 'created_by_details', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']
    
    def get_related_animal_name(self, obj):
        return obj.related_animal.name if obj.related_animal else None
    
    def get_related_health_record_details(self, obj):
        if obj.related_health_record:
            return {
                'id': obj.related_health_record.id,
                'vaccine_type': obj.related_health_record.vaccine_type,
                'date_administered': obj.related_health_record.date_administered,
                'veterinarian': obj.related_health_record.veterinarian
            }
        return None

class PurchaseItemSerializer(serializers.ModelSerializer):
    item_details = InventoryItemSerializer(source='item', read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = PurchaseItem
        fields = [
            'id', 'purchase', 'item', 'item_details', 'quantity', 
            'unit_price', 'total_price', 'notes'
        ]

class PurchaseSerializer(serializers.ModelSerializer):
    supplier_details = SupplierSerializer(source='supplier', read_only=True)
    items = PurchaseItemSerializer(many=True, read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    # NEW: Computed fields
    items_count = serializers.SerializerMethodField()
    days_until_delivery = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Purchase
        fields = [
            'id', 'supplier', 'supplier_details', 'status', 'order_date',
            'expected_delivery_date', 'delivery_date', 'total_cost',
            'invoice_number', 'notes', 'items', 'items_count', 
            'days_until_delivery', 'is_overdue', 'created_by', 
            'created_by_details', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_items_count(self, obj):
        return obj.items.count()
    
    def get_days_until_delivery(self, obj):
        if obj.expected_delivery_date:
            from django.utils import timezone
            delta = obj.expected_delivery_date - timezone.now().date()
            return delta.days
        return None
    
    def get_is_overdue(self, obj):
        if obj.expected_delivery_date and obj.status != 'RECEIVED':
            from django.utils import timezone
            return obj.expected_delivery_date < timezone.now().date()
        return False

# NEW: Audit Trail Serializer
class InventoryAuditLogSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    item_name = serializers.CharField(source='item.name', read_only=True)
    
    class Meta:
        model = InventoryAuditLog
        fields = [
            'id', 'item', 'item_name', 'action', 'field_changed', 
            'old_value', 'new_value', 'user', 'user_details', 
            'timestamp', 'notes'
        ]

# NEW: Serializer for procurement suggestions
class ProcurementSuggestionSerializer(serializers.Serializer):
    item_id = serializers.IntegerField()
    item_name = serializers.CharField()
    current_stock = serializers.DecimalField(max_digits=10, decimal_places=2)
    minimum_threshold = serializers.DecimalField(max_digits=10, decimal_places=2)
    suggested_quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    estimated_cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    urgency = serializers.ChoiceField(choices=['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'])
    preferred_supplier = serializers.CharField(allow_null=True)
    reason = serializers.CharField()

# NEW: Serializer for financial reporting
class FinancialReportSerializer(serializers.Serializer):
    period_start = serializers.DateField()
    period_end = serializers.DateField()
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2)
    current_inventory_value = serializers.DecimalField(max_digits=12, decimal_places=2)
    consumption_value = serializers.DecimalField(max_digits=12, decimal_places=2)
    purchase_count = serializers.IntegerField()
    avg_purchase_value = serializers.DecimalField(max_digits=10, decimal_places=2)

# NEW: Serializer for stock forecast
class StockForecastSerializer(serializers.Serializer):
    item_id = serializers.IntegerField()
    item_name = serializers.CharField()
    current_quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    unit = serializers.CharField()
    days_remaining = serializers.FloatField(allow_null=True)
    predicted_need = serializers.DecimalField(max_digits=10, decimal_places=2)
    daily_consumption = serializers.FloatField()
    recommendation = serializers.CharField()

# NEW: Medical consumption tracking serializer
class MedicalConsumptionSerializer(serializers.Serializer):
    item_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    animal_id = serializers.IntegerField(required=False, allow_null=True)
    health_record_id = serializers.IntegerField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate(self, data):
        # Check if item exists and has sufficient stock
        try:
            item = InventoryItem.objects.get(id=data['item_id'])
            if item.quantity < data['quantity']:
                raise serializers.ValidationError("Insufficient stock available")
        except InventoryItem.DoesNotExist:
            raise serializers.ValidationError("Item not found")
        
        return data
