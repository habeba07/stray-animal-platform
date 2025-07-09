from django.db.models import Sum, Avg, F, ExpressionWrapper, fields, Count, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta, date
from .models import InventoryItem, InventoryTransaction, Purchase, Supplier
from decimal import Decimal

def get_inventory_summary():
    """FIXED: Get summary statistics including items without cost"""
    total_items = InventoryItem.objects.count()
    low_stock_items = InventoryItem.objects.filter(quantity__lte=F('minimum_threshold')).count()
    expired_items = InventoryItem.objects.filter(expiry_date__lt=timezone.now().date()).count()
    
    # Fixed expiring soon logic with different thresholds by item type
    thirty_days_later = timezone.now().date() + timedelta(days=30)
    seven_days_later = timezone.now().date() + timedelta(days=7)
    
    expiring_soon = InventoryItem.objects.filter(
        Q(
            item_type='MEDICAL',
            expiry_date__gte=timezone.now().date(),
            expiry_date__lte=thirty_days_later
        ) | Q(
            ~Q(item_type='MEDICAL'),
            expiry_date__gte=timezone.now().date(),
            expiry_date__lte=seven_days_later
        )
    ).count()
    
    # FIXED: Include all items in total value calculation
    # Items with cost_per_unit
    items_with_cost = InventoryItem.objects.filter(
        cost_per_unit__isnull=False
    ).annotate(
        item_value=ExpressionWrapper(F('quantity') * F('cost_per_unit'), output_field=fields.DecimalField())
    ).aggregate(total=Sum('item_value'))['total'] or Decimal('0')
    
    # Items without cost (estimate based on category averages or default)
    items_without_cost = InventoryItem.objects.filter(cost_per_unit__isnull=True)
    estimated_value = Decimal('0')
    
    for item in items_without_cost:
        # Try to get average cost for similar items in same category
        avg_cost = InventoryItem.objects.filter(
            category=item.category,
            cost_per_unit__isnull=False
        ).aggregate(avg=Avg('cost_per_unit'))['avg']
        
        if avg_cost:
            estimated_value += item.quantity * avg_cost
        else:
            # Use minimal estimate for uncategorized items
            estimated_value += item.quantity * Decimal('1.00')  # $1 placeholder
    
    total_value = items_with_cost + estimated_value
    items_missing_cost = items_without_cost.count()
    
    # Additional metrics
    on_order_items = InventoryItem.objects.filter(on_order_quantity__gt=0).count()
    medical_items = InventoryItem.objects.filter(item_type='MEDICAL').count()
    
    return {
        'total_items': total_items,
        'low_stock_items': low_stock_items,
        'expired_items': expired_items,
        'expiring_soon': expiring_soon,
        'on_order_items': on_order_items,
        'medical_items': medical_items,
        'total_value': total_value,
        'items_missing_cost': items_missing_cost,
        'estimated_portion': estimated_value,
        'last_updated': timezone.now().isoformat()
    }

def get_consumption_rate(item_id, days=90):
    """
    Calculate average consumption rate for an item over a period
    Returns average units used per day
    """
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)
    
    # Get all consumption transactions (stock out, medical use, expired disposal)
    consumption_transactions = InventoryTransaction.objects.filter(
        item_id=item_id,
        transaction_type__in=['STOCK_OUT', 'MEDICAL_USE', 'EXPIRED_DISPOSAL'],
        transaction_date__gte=start_date,
        transaction_date__lte=end_date
    )
    
    total_consumed = consumption_transactions.aggregate(total=Sum('quantity'))['total'] or 0
    
    # Calculate daily consumption rate
    if days > 0:
        daily_rate = total_consumed / days
    else:
        daily_rate = 0
    
    # Additional analytics
    medical_usage = consumption_transactions.filter(
        transaction_type='MEDICAL_USE'
    ).aggregate(total=Sum('quantity'))['total'] or 0
    
    return {
        'item_id': item_id,
        'period_days': days,
        'total_consumed': total_consumed,
        'medical_usage': medical_usage,
        'daily_rate': daily_rate,
        'estimated_days_remaining': calculate_days_remaining(item_id, daily_rate),
        'consumption_breakdown': {
            'medical': medical_usage,
            'general': total_consumed - medical_usage
        }
    }

def calculate_days_remaining(item_id, daily_rate):
    """Calculate estimated days until stock is depleted"""
    try:
        item = InventoryItem.objects.get(id=item_id)
        if daily_rate <= 0:
            return None  # Cannot calculate if no consumption
        
        return item.quantity / daily_rate
    except InventoryItem.DoesNotExist:
        return None
    except ZeroDivisionError:
        return None

def get_purchase_trends(months=6):
    """Get monthly purchase trends"""
    end_date = timezone.now()
    start_date = end_date - timedelta(days=30 * months)
    
    purchases = Purchase.objects.filter(
        order_date__gte=start_date.date(),
        order_date__lte=end_date.date()
    )
    
    # Group by month
    trends = purchases.annotate(
        month=TruncMonth('order_date')
    ).values('month').annotate(
        count=Count('id'),
        total_cost=Sum('total_cost')
    ).order_by('month')
    
    return list(trends)

def get_transaction_history(item_id, limit=10):
    """Get recent transaction history for an item"""
    return InventoryTransaction.objects.filter(
        item_id=item_id
    ).select_related('created_by', 'related_animal').order_by('-transaction_date')[:limit]

def predict_stock_needs(days_to_forecast=30):
    """
    Predict stock needs for all items based on consumption rates
    Returns items that may need restocking within the forecast period
    """
    items_to_restock = []
    
    for item in InventoryItem.objects.all():
        consumption_data = get_consumption_rate(item.id)
        daily_rate = consumption_data.get('daily_rate', 0)
        
        if daily_rate <= 0:
            # If no consumption history, check if already low stock
            if item.is_low_on_stock:
                items_to_restock.append({
                    'item': item,
                    'current_quantity': item.quantity,
                    'days_remaining': None,
                    'predicted_need': item.minimum_threshold * 2,
                    'reason': 'Currently low stock, no consumption data'
                })
            continue
        
        days_remaining = consumption_data.get('estimated_days_remaining')
        
        if days_remaining is not None and days_remaining <= days_to_forecast:
            predicted_need = daily_rate * (days_to_forecast - max(0, days_remaining))
            
            items_to_restock.append({
                'item': item,
                'current_quantity': item.quantity,
                'days_remaining': days_remaining,
                'predicted_need': predicted_need,
                'daily_consumption': daily_rate
            })
    
    return items_to_restock

# NEW: Procurement workflow functions

def create_purchase_from_low_stock(item, quantity, supplier_id, created_by):
    """Create a purchase order for a low stock item"""
    try:
        supplier = Supplier.objects.get(id=supplier_id)
    except Supplier.DoesNotExist:
        raise ValueError(f"Supplier with id {supplier_id} not found")
    
    # Calculate expected delivery date
    expected_delivery = (
        date.today() + 
        timedelta(days=supplier.average_delivery_days)
    )
    
    # Create purchase order
    purchase = Purchase.objects.create(
        supplier=supplier,
        status='PENDING',
        order_date=date.today(),
        expected_delivery_date=expected_delivery,
        created_by=created_by,
        notes=f"Auto-generated for low stock: {item.name}"
    )
    
    # Add purchase item
    from .models import PurchaseItem
    PurchaseItem.objects.create(
        purchase=purchase,
        item=item,
        quantity=quantity,
        unit_price=item.cost_per_unit
    )
    
    # Update item's on_order_quantity
    item.on_order_quantity += quantity
    item.last_ordered_date = date.today()
    item.save()
    
    # Calculate total cost
    purchase.total_cost = quantity * item.cost_per_unit
    purchase.save()
    
    return purchase

def record_medical_consumption(item, quantity, animal=None, health_record=None, user=None):
    """Record consumption of medical items linked to health records"""
    if item.quantity < quantity:
        raise ValueError("Insufficient stock available")
    
    # Create transaction
    transaction = InventoryTransaction.objects.create(
        item=item,
        transaction_type='MEDICAL_USE',
        quantity=quantity,
        notes=f"Medical use for animal treatment",
        related_animal=animal,
        related_health_record=health_record,
        created_by=user
    )
    
    # Update item quantity
    item.quantity -= quantity
    item.save()
    
    return transaction

def get_expired_items_for_disposal():
    """Get expired items that need to be disposed of"""
    expired_items = InventoryItem.objects.filter(
        expiry_date__lt=timezone.now().date(),
        quantity__gt=0
    )
    
    disposal_list = []
    for item in expired_items:
        disposal_list.append({
            'item': item,
            'expired_days': (timezone.now().date() - item.expiry_date).days,
            'disposal_value': item.quantity * item.cost_per_unit,
            'batch_number': item.batch_number,
            'requires_special_disposal': item.item_type == 'MEDICAL'
        })
    
    return disposal_list

def create_disposal_transaction(item, quantity, reason, user):
    """Create disposal transaction for expired/damaged items"""
    if item.quantity < quantity:
        raise ValueError("Cannot dispose more than available quantity")
    
    transaction = InventoryTransaction.objects.create(
        item=item,
        transaction_type='EXPIRED_DISPOSAL',
        quantity=quantity,
        notes=f"Disposal: {reason}",
        created_by=user
    )
    
    # Update item quantity
    item.quantity -= quantity
    item.save()
    
    return transaction

def get_procurement_suggestions():
    """Get intelligent procurement suggestions"""
    suggestions = []
    
    # Low stock items
    low_stock = InventoryItem.objects.filter(
        quantity__lte=F('minimum_threshold')
    ).select_related('preferred_supplier')
    
    for item in low_stock:
        urgency = 'CRITICAL' if item.quantity <= 0 else 'HIGH'
        suggested_qty = max(item.minimum_threshold * 2, item.quantity + 50)
        
        suggestions.append({
            'type': 'LOW_STOCK',
            'item': item,
            'urgency': urgency,
            'current_stock': item.quantity,
            'suggested_quantity': suggested_qty,
            'estimated_cost': suggested_qty * item.cost_per_unit,
            'supplier': item.preferred_supplier,
            'reason': f"Stock below minimum threshold ({item.minimum_threshold})"
        })
    
    # Items predicted to run out soon
    forecast = predict_stock_needs(30)
    for forecast_item in forecast:
        item = forecast_item['item']
        if item.quantity > item.minimum_threshold:  # Not already in low stock list
            suggestions.append({
                'type': 'PREDICTED_SHORTAGE',
                'item': item,
                'urgency': 'MEDIUM',
                'current_stock': item.quantity,
                'suggested_quantity': forecast_item['predicted_need'],
                'estimated_cost': forecast_item['predicted_need'] * item.cost_per_unit,
                'supplier': item.preferred_supplier,
                'reason': f"Predicted to run out in {forecast_item['days_remaining']:.1f} days"
            })
    
    return sorted(suggestions, key=lambda x: {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2}[x['urgency']])

def get_financial_report(start_date=None, end_date=None):
    """Generate financial report for inventory"""
    if not start_date:
        start_date = timezone.now().date() - timedelta(days=30)
    if not end_date:
        end_date = timezone.now().date()
    
    # Purchases in period
    purchases = Purchase.objects.filter(
        order_date__gte=start_date,
        order_date__lte=end_date,
        status='RECEIVED'
    )
    
    total_spent = purchases.aggregate(total=Sum('total_cost'))['total'] or 0
    
    # Stock value changes
    current_value = get_inventory_summary()['total_value']
    
    # Consumption value
    consumption_transactions = InventoryTransaction.objects.filter(
        transaction_date__gte=start_date,
        transaction_date__lte=end_date,
        transaction_type__in=['STOCK_OUT', 'MEDICAL_USE', 'EXPIRED_DISPOSAL']
    ).select_related('item')
    
    consumption_value = sum(
        trans.quantity * trans.item.cost_per_unit 
        for trans in consumption_transactions
        if trans.item.cost_per_unit
    )
    
    return {
        'period': {'start': start_date, 'end': end_date},
        'total_spent': total_spent,
        'current_inventory_value': current_value,
        'consumption_value': consumption_value,
        'purchase_count': purchases.count(),
        'avg_purchase_value': total_spent / purchases.count() if purchases.count() > 0 else 0
    }
