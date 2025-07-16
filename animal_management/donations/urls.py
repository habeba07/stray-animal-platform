from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DonationViewSet, DonationCampaignViewSet, ImpactCategoryViewSet,
    DonationImpactViewSet, SuccessStoryViewSet, RecurringDonationViewSet,
    BudgetViewSet, FinancialReportViewSet
)

router = DefaultRouter()
router.register(r'donations', DonationViewSet)
router.register(r'campaigns', DonationCampaignViewSet)
router.register(r'impact-categories', ImpactCategoryViewSet)
router.register(r'donation-impacts', DonationImpactViewSet)
router.register(r'success-stories', SuccessStoryViewSet)
router.register(r'recurring-donations', RecurringDonationViewSet)
router.register(r'budgets', BudgetViewSet)
router.register(r'financial-reports', FinancialReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]