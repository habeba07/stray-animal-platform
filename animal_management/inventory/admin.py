from django.contrib import admin
from .models import (
    ItemCategory,
    InventoryItem,
    InventoryTransaction,
    Supplier,
    Purchase,
    PurchaseItem
)

@admin.register(ItemCategory)
class ItemCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'quantity', 'unit', 'minimum_threshold', 
                   'cost_per_unit', 'expiry_date', 'is_low_on_stock', 'is_expired']
    list_filter = ['category', 'unit', 'created_at']
    search_fields = ['name', 'description', 'location']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'description')
        }),
        ('Quantity Information', {
            'fields': ('quantity', 'unit', 'minimum_threshold')
        }),
        ('Financial Information', {
            'fields': ('cost_per_unit',)
        }),
        ('Additional Information', {
            'fields': ('expiry_date', 'location', 'image')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = ['item', 'transaction_type', 'quantity', 'transaction_date', 'created_by']
    list_filter = ['transaction_type', 'transaction_date', 'created_by']
    search_fields = ['item__name', 'notes']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Transaction Information', {
            'fields': ('item', 'transaction_type', 'quantity', 'transaction_date')
        }),
        ('Additional Information', {
            'fields': ('notes', 'created_by')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_person', 'email', 'phone']
    search_fields = ['name', 'contact_person', 'email']
    readonly_fields = ['created_at', 'updated_at']

class PurchaseItemInline(admin.TabularInline):
    model = PurchaseItem
    extra = 1

@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ['supplier', 'status', 'order_date', 'expected_delivery_date', 
                   'delivery_date', 'total_cost', 'created_by']
    list_filter = ['status', 'order_date', 'supplier']
    search_fields = ['supplier__name', 'invoice_number']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [PurchaseItemInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('supplier', 'status', 'order_date', 'expected_delivery_date', 'delivery_date')
        }),
        ('Financial Information', {
            'fields': ('total_cost', 'invoice_number')
        }),
        ('Additional Information', {
            'fields': ('notes', 'created_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(PurchaseItem)
class PurchaseItemAdmin(admin.ModelAdmin):
    list_display = ['purchase', 'item', 'quantity', 'unit_price', 'total_price']
    list_filter = ['purchase__order_date']
    search_fields = ['item__name', 'purchase__invoice_number']
