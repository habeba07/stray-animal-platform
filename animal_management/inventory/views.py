from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import F, Q
from django.db import transaction
from datetime import datetime, timedelta
from django.utils import timezone
from .models import (
    ItemCategory,
    InventoryItem,
    InventoryTransaction,
    Supplier,
    Purchase,
    PurchaseItem,
    InventoryAuditLog
)
from .serializers import (
    ItemCategorySerializer,
    InventoryItemSerializer,
    InventoryTransactionSerializer,
    SupplierSerializer,
    PurchaseSerializer,
    PurchaseItemSerializer,
    InventoryAuditLogSerializer,
    MedicalConsumptionSerializer,
    ProcurementSuggestionSerializer,
    FinancialReportSerializer
)
from .services import (
    get_inventory_summary,
    get_consumption_rate,
    get_purchase_trends,
    get_transaction_history,
    predict_stock_needs,
    create_purchase_from_low_stock,
    record_medical_consumption,
    get_financial_report
)
from .integrations import (
    consume_medical_inventory,
    find_medical_items_by_type,
    get_low_stock_medical_items,
    get_expiring_medical_items,
    bulk_consume_medical_supplies,
    get_medical_consumption_stats,
    validate_medical_inventory_for_vaccination,
    create_automatic_reorder_for_medical_item,
    InventoryIntegrationError
)
from notifications.services import create_notification

class ItemCategoryViewSet(viewsets.ModelViewSet):
    queryset = ItemCategory.objects.all()
    serializer_class = ItemCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['unit', 'item_type']
    search_fields = ['name', 'description', 'location', 'batch_number']
    ordering_fields = ['name', 'quantity', 'expiry_date', 'created_at']
    
    def get_permissions(self):
        if self.request.user.is_authenticated and hasattr(self.request.user, 'user_type'):
           if self.request.user.user_type in ['STAFF', 'SHELTER', 'AUTHORITY']:
              return [permissions.IsAuthenticated()]
           return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Log item creation"""
        item = serializer.save()
        InventoryAuditLog.objects.create(
            item=item,
            action='CREATE',
            user=self.request.user,
            notes=f"Item created: {item.name}"
        )
    
    def perform_update(self, serializer):
        """Log item updates with field changes"""
        instance = self.get_object()
        old_data = {
            'quantity': instance.quantity,
            'cost_per_unit': instance.cost_per_unit,
            'expiry_date': instance.expiry_date,
        }
        
        item = serializer.save()
        
        # Log changes
        for field, old_value in old_data.items():
            new_value = getattr(item, field)
            if old_value != new_value:
                InventoryAuditLog.objects.create(
                    item=item,
                    action='UPDATE',
                    field_changed=field,
                    old_value=str(old_value),
                    new_value=str(new_value),
                    user=self.request.user
                )
    
    def perform_destroy(self, instance):
        """Log item deletion"""
        InventoryAuditLog.objects.create(
            item=instance,
            action='DELETE',
            user=self.request.user,
            notes=f"Item deleted: {instance.name}"
        )

        instance.delete()

    def get_queryset(self):
    	queryset = InventoryItem.objects.select_related('category').all()
    
    	# Handle category filtering by name
    	category_param = self.request.query_params.get('category', None)
    	if category_param:
            categories = [c.strip() for c in category_param.split(',')]
            # Filter by category name or item_type
            category_q = Q()
            for cat in categories:
                category_q |= Q(category__name__icontains=cat) | Q(item_type__iexact=cat)
            queryset = queryset.filter(category_q)
    
    	# Apply other filters normally  
    	for field in ['unit', 'item_type']:
            value = self.request.query_params.get(field, None)
            if value:
                queryset = queryset.filter(**{field: value})
            
    	return queryset
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get items with stock below minimum threshold"""
        low_stock_items = self.queryset.filter(quantity__lte=F('minimum_threshold'))
        serializer = self.get_serializer(low_stock_items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Get items that will expire soon based on item type"""
        thirty_days_later = timezone.now().date() + timedelta(days=30)
        seven_days_later = timezone.now().date() + timedelta(days=7)
        
        # Medical items: 30 days, others: 7 days
        expiring_items = self.queryset.filter(
            Q(
                item_type='MEDICAL',
                expiry_date__lte=thirty_days_later,
                expiry_date__gte=timezone.now().date()
            ) | Q(
                ~Q(item_type='MEDICAL'),
                expiry_date__lte=seven_days_later,
                expiry_date__gte=timezone.now().date()
            )
        )
        serializer = self.get_serializer(expiring_items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def expired(self, request):
        """Get expired items"""
        expired_items = self.queryset.filter(expiry_date__lt=timezone.now().date())
        serializer = self.get_serializer(expired_items, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def order_now(self, request, pk=None):
        """NEW: Create purchase order for low stock item"""
        item = self.get_object()
        quantity_needed = request.data.get('quantity', item.minimum_threshold * 2)
        supplier_id = request.data.get('supplier_id', item.preferred_supplier_id)
        
        if not supplier_id:
            return Response(
                {"error": "No supplier specified and no preferred supplier set"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            purchase = create_purchase_from_low_stock(
                item=item,
                quantity=quantity_needed,
                supplier_id=supplier_id,
                created_by=request.user
            )
            
            return Response({
                "message": f"Purchase order created for {quantity_needed} {item.unit} of {item.name}",
                "purchase_id": purchase.id,
                "estimated_delivery": purchase.expected_delivery_date
            })
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """NEW: Bulk update multiple items"""
        items_data = request.data.get('items', [])
        updated_items = []
        
        with transaction.atomic():
            for item_data in items_data:
                item_id = item_data.get('id')
                if not item_id:
                    continue
                
                try:
                    item = InventoryItem.objects.get(id=item_id)
                    old_quantity = item.quantity
                    
                    # Update fields
                    for field, value in item_data.items():
                        if field != 'id' and hasattr(item, field):
                            setattr(item, field, value)
                    
                    item.save()
                    
                    # Log bulk update
                    if 'quantity' in item_data and old_quantity != item.quantity:
                        InventoryAuditLog.objects.create(
                            item=item,
                            action='STOCK_CHANGE',
                            field_changed='quantity',
                            old_value=str(old_quantity),
                            new_value=str(item.quantity),
                            user=request.user,
                            notes="Bulk update"
                        )
                    
                    updated_items.append(item.id)
                except InventoryItem.DoesNotExist:
                    continue
        
        return Response({
            "message": f"Updated {len(updated_items)} items",
            "updated_items": updated_items
        })
    
    @action(detail=True, methods=['post'])
    def record_medical_use(self, request, pk=None):
        """NEW: Record medical item usage linked to health records"""
        item = self.get_object()
        quantity_used = request.data.get('quantity', 1)
        animal_id = request.data.get('animal_id')
        health_record_id = request.data.get('health_record_id')
        
        if item.quantity < quantity_used:
            return Response(
                {"error": "Insufficient stock available"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Create transaction
                transaction_record = InventoryTransaction.objects.create(
                    item=item,
                    transaction_type='MEDICAL_USE',
                    quantity=quantity_used,
                    notes=f"Used for animal medical treatment",
                    related_animal_id=animal_id,
                    related_health_record_id=health_record_id,
                    created_by=request.user
                )
                
                # Update item quantity
                item.quantity -= quantity_used
                item.save()
                
                # Log the change
                InventoryAuditLog.objects.create(
                    item=item,
                    action='STOCK_CHANGE',
                    field_changed='quantity',
                    new_value=str(item.quantity),
                    user=request.user,
                    notes=f"Medical use for animal #{animal_id}"
                )
            
            return Response({
                "message": f"Recorded use of {quantity_used} {item.unit} of {item.name}",
                "remaining_stock": item.quantity
            })
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def audit_trail(self, request, pk=None):
        """NEW: Get audit trail for an item"""
        item = self.get_object()
        logs = InventoryAuditLog.objects.filter(item=item)[:20]
        serializer = InventoryAuditLogSerializer(logs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def consumption_rate(self, request, pk=None):
        """Get consumption rate for an item"""
        days = int(request.query_params.get('days', 90))
        data = get_consumption_rate(pk, days)
        return Response(data)
    
    @action(detail=True, methods=['get'])
    def transaction_history(self, request, pk=None):
        """Get transaction history for an item"""
        limit = int(request.query_params.get('limit', 10))
        transactions = get_transaction_history(pk, limit)
        serializer = InventoryTransactionSerializer(transactions, many=True)
        return Response(serializer.data)

class InventoryTransactionViewSet(viewsets.ModelViewSet):
    queryset = InventoryTransaction.objects.all()
    serializer_class = InventoryTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['item', 'transaction_type', 'related_animal']
    ordering_fields = ['transaction_date', 'created_at']
    
    def perform_create(self, serializer):
        # Get transaction data
        item = serializer.validated_data['item']
        quantity = serializer.validated_data['quantity']
        transaction_type = serializer.validated_data['transaction_type']
        old_quantity = item.quantity
        
        # Update item quantity based on transaction type
        if transaction_type == 'STOCK_IN':
            item.quantity += quantity
        elif transaction_type in ['STOCK_OUT', 'MEDICAL_USE', 'EXPIRED_DISPOSAL']:
            if item.quantity < quantity:
                raise ValidationError("Not enough stock available.")
            item.quantity -= quantity
        elif transaction_type == 'ADJUSTMENT':
            item.quantity += quantity  # quantity can be negative for adjustments
        
        item.save()
        
        # Save the transaction
        transaction_record = serializer.save(created_by=self.request.user)
        
        # Log the change
        InventoryAuditLog.objects.create(
            item=item,
            action='STOCK_CHANGE',
            field_changed='quantity',
            old_value=str(old_quantity),
            new_value=str(item.quantity),
            user=self.request.user,
            notes=f"Transaction: {transaction_type}"
        )
    
    def perform_destroy(self, instance):
        # Reverse the quantity adjustment when deleting a transaction
        item = instance.item
        quantity = instance.quantity
        transaction_type = instance.transaction_type
        old_quantity = item.quantity
        
        if transaction_type == 'STOCK_IN':
            item.quantity -= quantity
        elif transaction_type in ['STOCK_OUT', 'MEDICAL_USE', 'EXPIRED_DISPOSAL']:
            item.quantity += quantity
        elif transaction_type == 'ADJUSTMENT':
            item.quantity -= quantity
        
        item.save()
        
        # Log the reversal
        InventoryAuditLog.objects.create(
            item=item,
            action='STOCK_CHANGE',
            field_changed='quantity',
            old_value=str(old_quantity),
            new_value=str(item.quantity),
            user=self.request.user,
            notes=f"Transaction deleted: {transaction_type}"
        )
        
        instance.delete()

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'contact_person', 'email']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['supplier', 'status']
    ordering_fields = ['order_date', 'created_at']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        """Mark a purchase as received and update inventory"""
        purchase = self.get_object()
        
        if purchase.status == 'RECEIVED':
            return Response({"detail": "This purchase is already marked as received."}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        delivery_date = request.data.get('delivery_date', timezone.now().date().isoformat())
        if isinstance(delivery_date, str):
            try:
                delivery_date = datetime.strptime(delivery_date, '%Y-%m-%d').date()
            except ValueError:
                delivery_date = timezone.now().date()
        
        with transaction.atomic():
            # Update purchase status
            purchase.status = 'RECEIVED'
            purchase.delivery_date = delivery_date
            purchase.save()
            
            # Process each purchase item to update inventory
            for purchase_item in purchase.items.all():
                old_quantity = purchase_item.item.quantity
                
                # Create stock in transaction
                InventoryTransaction.objects.create(
                    item=purchase_item.item,
                    transaction_type='STOCK_IN',
                    quantity=purchase_item.quantity,
                    notes=f"Received from purchase #{purchase.id}",
                    created_by=request.user
                )
                
                # Update on_order_quantity
                purchase_item.item.on_order_quantity = max(0, 
                    purchase_item.item.on_order_quantity - purchase_item.quantity)
                
                # Update item cost if different
                if purchase_item.unit_price != purchase_item.item.cost_per_unit:
                    purchase_item.item.cost_per_unit = purchase_item.unit_price
                
                purchase_item.item.save()
        
        return Response(self.get_serializer(purchase).data)
    
    @action(detail=False, methods=['get'])
    def trends(self, request):
        """Get purchase trends"""
        months = int(request.query_params.get('months', 6))
        data = get_purchase_trends(months)
        return Response(data)

class PurchaseItemViewSet(viewsets.ModelViewSet):
    queryset = PurchaseItem.objects.all()
    serializer_class = PurchaseItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['purchase', 'item']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

class InventoryAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get inventory summary statistics"""
        data = get_inventory_summary()
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def procurement_suggestions(self, request):
        """NEW: Get items that need to be ordered"""
        suggestions = []
        
        # Items with low stock
        low_stock_items = InventoryItem.objects.filter(
            quantity__lte=F('minimum_threshold')
        ).select_related('preferred_supplier')
        
        for item in low_stock_items:
            suggested_quantity = item.minimum_threshold * 2 - item.quantity
            suggestions.append({
                'item_id': item.id,
                'item_name': item.name,
                'current_stock': item.quantity,
                'minimum_threshold': item.minimum_threshold,
                'suggested_quantity': suggested_quantity,
                'preferred_supplier': item.preferred_supplier.name if item.preferred_supplier else None,
                'estimated_cost': suggested_quantity * item.cost_per_unit,
                'urgency': 'HIGH' if item.quantity <= 0 else 'MEDIUM'
            })
        
        return Response(suggestions)
    
    @action(detail=False, methods=['get'])
    def stock_forecast(self, request):
        """Predict stock needs for upcoming period"""
        days = int(request.query_params.get('days', 30))
        forecast_data = predict_stock_needs(days)
        
        formatted_data = []
        for item_data in forecast_data:
            item = item_data['item']
            formatted_data.append({
                'id': item.id,
                'name': item.name,
                'current_quantity': item_data['current_quantity'],
                'unit': item.unit,
                'days_remaining': round(item_data['days_remaining'], 1) if item_data['days_remaining'] is not None else None,
                'predicted_need': round(item_data['predicted_need'], 2),
            })
        
        return Response(formatted_data)

# NEW: Medical Integration ViewSet for healthcare system integration
class MedicalIntegrationViewSet(viewsets.ViewSet):
    """ViewSet for medical inventory integration with healthcare records"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def consume_medical_item(self, request):
        """Consume medical inventory with proper tracking"""
        serializer = MedicalConsumptionSerializer(data=request.data)
        if serializer.is_valid():
            try:
                result = consume_medical_inventory(
                    item_id=serializer.validated_data['item_id'],
                    quantity=serializer.validated_data['quantity'],
                    animal_id=serializer.validated_data.get('animal_id'),
                    health_record_id=serializer.validated_data.get('health_record_id'),
                    user=request.user,
                    notes=serializer.validated_data.get('notes', '')
                )
                return Response(result)
            except InventoryIntegrationError as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def find_medical_items(self, request):
        """Find medical items by vaccine type or search term"""
        vaccine_type = request.query_params.get('vaccine_type')
        search_term = request.query_params.get('search')
        
        items = find_medical_items_by_type(
            vaccine_type=vaccine_type,
            search_term=search_term
        )
        
        serializer = InventoryItemSerializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def low_stock_medical(self, request):
        """Get medical items that are running low"""
        items = get_low_stock_medical_items()
        serializer = InventoryItemSerializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def expiring_medical(self, request):
        """Get medical items expiring soon"""
        days = int(request.query_params.get('days', 30))
        items = get_expiring_medical_items(days=days)
        serializer = InventoryItemSerializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_consume(self, request):
        """Bulk consume multiple medical supplies"""
        consumption_list = request.data.get('items', [])
        notes = request.data.get('notes', '')
        
        if not consumption_list:
            return Response(
                {'error': 'No items provided for consumption'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = bulk_consume_medical_supplies(
            consumption_list=consumption_list,
            user=request.user,
            notes=notes
        )
        
        return Response(results)
    
    @action(detail=False, methods=['get'])
    def consumption_stats(self, request):
        """Get medical inventory consumption statistics"""
        days = int(request.query_params.get('days', 30))
        stats = get_medical_consumption_stats(days=days)
        return Response(stats)
    
    @action(detail=False, methods=['post'])
    def validate_for_vaccination(self, request):
        """Validate inventory availability for vaccination"""
        vaccine_type = request.data.get('vaccine_type')
        quantity = float(request.data.get('quantity', 1))
        
        if not vaccine_type:
            return Response(
                {'error': 'vaccine_type is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        validation = validate_medical_inventory_for_vaccination(
            vaccine_type=vaccine_type,
            quantity=quantity
        )
        
        return Response(validation)
    
    @action(detail=True, methods=['post'])
    def auto_reorder(self, request, pk=None):
        """Create automatic reorder for medical item"""
        try:
            result = create_automatic_reorder_for_medical_item(
                item_id=pk,
                user=request.user
            )
            
            if result['success']:
                return Response(result)
            else:
                return Response(
                    {'error': result['message']}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
