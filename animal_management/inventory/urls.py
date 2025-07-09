from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ItemCategoryViewSet,
    InventoryItemViewSet,
    InventoryTransactionViewSet,
    SupplierViewSet,
    PurchaseViewSet,
    PurchaseItemViewSet,
    InventoryAnalyticsViewSet,
    MedicalIntegrationViewSet  # We'll need to add this to views
)

router = DefaultRouter()
router.register('categories', ItemCategoryViewSet, basename='inventory-categories')
router.register('items', InventoryItemViewSet, basename='inventory-items')
router.register('transactions', InventoryTransactionViewSet, basename='inventory-transactions')
router.register('suppliers', SupplierViewSet, basename='inventory-suppliers')
router.register('purchases', PurchaseViewSet, basename='inventory-purchases')
router.register('purchase-items', PurchaseItemViewSet, basename='inventory-purchase-items')
router.register('analytics', InventoryAnalyticsViewSet, basename='inventory-analytics')
router.register('medical-integration', MedicalIntegrationViewSet, basename='inventory-medical')

urlpatterns = [
    path('', include(router.urls)),
]
