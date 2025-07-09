"""
Inventory integration utilities for connecting with other system components
"""

from django.db import transaction, models
from django.utils import timezone
from decimal import Decimal
from .models import InventoryItem, InventoryTransaction, InventoryAuditLog

class InventoryIntegrationError(Exception):
    """Custom exception for inventory integration errors"""
    pass

def consume_medical_inventory(item_id, quantity, animal=None, health_record=None, user=None, notes=""):
    """
    Consume medical inventory with proper error handling and audit trail
    
    Args:
        item_id: ID of the inventory item
        quantity: Amount to consume
        animal: Animal object (optional)
        health_record: Health record object (optional)
        user: User performing the action
        notes: Additional notes
    
    Returns:
        dict: Transaction details and updated inventory info
    
    Raises:
        InventoryIntegrationError: If consumption fails
    """
    try:
        with transaction.atomic():
            # Get inventory item
            try:
                item = InventoryItem.objects.select_for_update().get(id=item_id)
            except InventoryItem.DoesNotExist:
                raise InventoryIntegrationError(f"Inventory item with ID {item_id} not found")
            
            # Validate item type
            if item.item_type != 'MEDICAL':
                raise InventoryIntegrationError(f"Item {item.name} is not a medical item")
            
            # Check sufficient quantity
            if item.quantity < Decimal(str(quantity)):
                raise InventoryIntegrationError(
                    f"Insufficient stock: {item.quantity} {item.unit} available, {quantity} requested"
                )
            
            # Check expiry
            if item.is_expired:
                raise InventoryIntegrationError(f"Item {item.name} is expired (expired on {item.expiry_date})")
            
            # Warn if expiring soon
            warning = None
            if item.is_expiring_soon:
                warning = f"Item {item.name} expires in {item.days_until_expiry} days"
            
            old_quantity = item.quantity
            
            # Create inventory transaction
            inventory_transaction = InventoryTransaction.objects.create(
                item=item,
                transaction_type='MEDICAL_USE',
                quantity=Decimal(str(quantity)),
                notes=notes or f"Medical use for {animal.name if animal else 'treatment'}",
                related_animal=animal,
                related_health_record=health_record,
                created_by=user
            )
            
            # Update item quantity
            item.quantity -= Decimal(str(quantity))
            item.save()
            
            # Create audit log
            InventoryAuditLog.objects.create(
                item=item,
                action='STOCK_CHANGE',
                field_changed='quantity',
                old_value=str(old_quantity),
                new_value=str(item.quantity),
                user=user,
                notes=f"Medical consumption: {notes}"
            )
            
            return {
                'success': True,
                'transaction_id': inventory_transaction.id,
                'remaining_quantity': item.quantity,
                'warning': warning,
                'message': f"Consumed {quantity} {item.unit} of {item.name}"
            }
            
    except Exception as e:
        if isinstance(e, InventoryIntegrationError):
            raise
        else:
            raise InventoryIntegrationError(f"Unexpected error: {str(e)}")

def find_medical_items_by_type(vaccine_type=None, search_term=None):
    """
    Find medical inventory items suitable for specific treatments
    
    Args:
        vaccine_type: Type of vaccine needed
        search_term: Search term for item name
    
    Returns:
        QuerySet: Available medical items
    """
    items = InventoryItem.objects.filter(
        item_type='MEDICAL',
        quantity__gt=0
    ).exclude(
        expiry_date__lt=timezone.now().date()
    )
    
    if vaccine_type:
        # Map vaccine types to common inventory item names
        vaccine_mapping = {
            'RABIES': ['rabies', 'rabvac'],
            'DISTEMPER': ['distemper', 'dhpp', 'da2pp'],
            'PARVOVIRUS': ['parvo', 'dhpp', 'da2pp'],
            'HEPATITIS': ['hepatitis', 'dhpp', 'da2pp'],
            'LEPTOSPIROSIS': ['lepto', 'dhpp'],
            'BORDETELLA': ['bordetella', 'kennel cough'],
            'LYME': ['lyme'],
            'FVRCP': ['fvrcp', 'feline'],
            'FELV': ['felv', 'feline leukemia'],
        }
        
        search_terms = vaccine_mapping.get(vaccine_type, [vaccine_type.lower()])
        
        from django.db.models import Q
        query = Q()
        for term in search_terms:
            query |= Q(name__icontains=term) | Q(description__icontains=term)
        
        items = items.filter(query)
    
    if search_term:
        items = items.filter(
            models.Q(name__icontains=search_term) |
            models.Q(description__icontains=search_term)
        )
    
    return items.order_by('expiry_date', 'name')

def get_low_stock_medical_items():
    """Get medical items that are running low on stock"""
    return InventoryItem.objects.filter(
        item_type='MEDICAL',
        quantity__lte=models.F('minimum_threshold')
    ).order_by('quantity')

def get_expiring_medical_items(days=30):
    """Get medical items expiring within specified days"""
    cutoff_date = timezone.now().date() + timezone.timedelta(days=days)
    
    return InventoryItem.objects.filter(
        item_type='MEDICAL',
        expiry_date__lte=cutoff_date,
        expiry_date__gte=timezone.now().date(),
        quantity__gt=0
    ).order_by('expiry_date')

def bulk_consume_medical_supplies(consumption_list, user=None, notes=""):
    """
    Consume multiple medical supplies in a single transaction
    
    Args:
        consumption_list: List of dicts with 'item_id', 'quantity', 'notes'
        user: User performing the action
        notes: General notes for the operation
    
    Returns:
        dict: Results summary
    """
    results = {
        'success_count': 0,
        'error_count': 0,
        'errors': [],
        'transactions': []
    }
    
    for consumption in consumption_list:
        try:
            result = consume_medical_inventory(
                item_id=consumption['item_id'],
                quantity=consumption['quantity'],
                user=user,
                notes=consumption.get('notes', notes)
            )
            results['success_count'] += 1
            results['transactions'].append(result)
        except InventoryIntegrationError as e:
            results['error_count'] += 1
            results['errors'].append({
                'item_id': consumption['item_id'],
                'error': str(e)
            })
    
    return results

def get_medical_consumption_stats(days=30):
    """Get medical inventory consumption statistics"""
    from django.db.models import Sum, Count
    from datetime import timedelta
    
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)
    
    stats = InventoryTransaction.objects.filter(
        transaction_type='MEDICAL_USE',
        transaction_date__gte=start_date,
        item__item_type='MEDICAL'
    ).aggregate(
        total_consumption=Sum('quantity'),
        transaction_count=Count('id'),
        unique_items=Count('item', distinct=True)
    )
    
    # Top consumed items
    top_items = InventoryTransaction.objects.filter(
        transaction_type='MEDICAL_USE',
        transaction_date__gte=start_date,
        item__item_type='MEDICAL'
    ).values(
        'item__name',
        'item__unit'
    ).annotate(
        total_consumed=Sum('quantity')
    ).order_by('-total_consumed')[:10]
    
    return {
        'period_days': days,
        'total_consumption': stats['total_consumption'] or 0,
        'transaction_count': stats['transaction_count'] or 0,
        'unique_items': stats['unique_items'] or 0,
        'top_consumed_items': list(top_items)
    }

def validate_medical_inventory_for_vaccination(vaccine_type, quantity=1):
    """
    Validate if sufficient medical inventory exists for a vaccination
    
    Args:
        vaccine_type: Type of vaccine
        quantity: Required quantity (default 1)
    
    Returns:
        dict: Validation results with available items
    """
    available_items = find_medical_items_by_type(vaccine_type=vaccine_type)
    
    sufficient_items = available_items.filter(quantity__gte=quantity)
    
    return {
        'sufficient_stock': sufficient_items.exists(),
        'available_items': [
            {
                'id': item.id,
                'name': item.name,
                'quantity': item.quantity,
                'unit': item.unit,
                'expiry_date': item.expiry_date,
                'days_until_expiry': item.days_until_expiry,
                'batch_number': item.batch_number
            }
            for item in sufficient_items[:5]  # Top 5 options
        ],
        'low_stock_items': [
            {
                'id': item.id,
                'name': item.name,
                'quantity': item.quantity,
                'unit': item.unit
            }
            for item in available_items.filter(quantity__lt=quantity)
        ]
    }

def create_automatic_reorder_for_medical_item(item_id, user=None):
    """
    Create automatic reorder for medical item when it hits minimum threshold
    
    Args:
        item_id: ID of the inventory item
        user: User triggering the reorder
    
    Returns:
        dict: Reorder creation results
    """
    try:
        item = InventoryItem.objects.get(id=item_id, item_type='MEDICAL')
        
        if not item.is_low_on_stock:
            return {
                'success': False,
                'message': f"{item.name} is not below minimum threshold"
            }
        
        if not item.preferred_supplier:
            return {
                'success': False,
                'message': f"No preferred supplier set for {item.name}"
            }
        
        # Calculate suggested quantity (double the minimum threshold)
        suggested_quantity = item.minimum_threshold * 2
        
        from .services import create_purchase_from_low_stock
        
        purchase = create_purchase_from_low_stock(
            item=item,
            quantity=suggested_quantity,
            supplier_id=item.preferred_supplier_id,
            created_by=user
        )
        
        return {
            'success': True,
            'purchase_id': purchase.id,
            'message': f"Created purchase order for {suggested_quantity} {item.unit} of {item.name}",
            'estimated_delivery': purchase.expected_delivery_date
        }
        
    except InventoryItem.DoesNotExist:
        return {
            'success': False,
            'message': f"Medical item with ID {item_id} not found"
        }
    except Exception as e:
        return {
            'success': False,
            'message': f"Error creating reorder: {str(e)}"
        }
