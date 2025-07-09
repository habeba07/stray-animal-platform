from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

from users.views import UserViewSet
from animals.views import AnimalViewSet
from reports.views import ReportViewSet
from users.auth import login_view
from donations.views import ImpactDashboardViewSet, DonationCampaignViewSet, DonationViewSet, RecurringDonationViewSet
from healthcare.views import (
    VaccinationRecordViewSet, 
    MedicalRecordViewSet, 
    HealthStatusViewSet, 
    AnimalHealthViewSet
)
from adoptions.views import (
    AdopterProfileViewSet,
    AnimalBehaviorProfileViewSet,
    AdoptionApplicationViewSet,
    AdoptionMatchViewSet
)

from community.views import (
    UserActivityViewSet, RewardViewSet, RewardRedemptionViewSet, AchievementViewSet,
    ForumCategoryViewSet, ForumTopicViewSet, ForumPostViewSet, KnowledgeArticleViewSet
)


from volunteers.views import (
    VolunteerProfileViewSet, VolunteerOpportunityViewSet, VolunteerAssignmentViewSet,
    RescueVolunteerAssignmentViewSet, VolunteerTrainingProgressViewSet, 
    VolunteerSkillCertificationViewSet, VolunteerManagementViewSet
)

from resources.views import (
    ResourceCategoryViewSet,
    EducationalResourceViewSet,
    ResourceRatingViewSet,
    LearningProgressViewSet
)

from virtual_adoptions.views import (
    VirtualAdoptionViewSet,
    VirtualAdoptionUpdateViewSet,
    VirtualAdoptionLevelViewSet
)

from notifications.views import NotificationViewSet

from inventory.views import (
    ItemCategoryViewSet,
    InventoryItemViewSet,
    InventoryTransactionViewSet,
    SupplierViewSet,
    PurchaseViewSet,
    PurchaseItemViewSet,
    InventoryAnalyticsViewSet
)



from analytics.views import PredictiveAnalyticsViewSet
from analytics.authority_views import AuthorityAnalyticsViewSet

from mental_health.views import (
    ResourceCategoryViewSet as MentalHealthCategoryViewSet,
    MentalHealthResourceViewSet,
    SelfCareReminderViewSet,
    StressLogEntryViewSet
)

from animals.views import setup_production_simple
from animals.views import setup_production_simple, import_data_simple

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'animals', AnimalViewSet)
router.register(r'reports', ReportViewSet)
router.register(r'vaccinations', VaccinationRecordViewSet)
router.register(r'medical-records', MedicalRecordViewSet)
router.register(r'health-status', HealthStatusViewSet)
router.register(r'animal-health', AnimalHealthViewSet, basename='animal-health')
router.register(r'adopter-profiles', AdopterProfileViewSet)
router.register(r'animal-behavior-profiles', AnimalBehaviorProfileViewSet)
router.register(r'adoption-applications', AdoptionApplicationViewSet)
router.register(r'adoption-matches', AdoptionMatchViewSet)
router.register(r'donation-campaigns', DonationCampaignViewSet)
router.register(r'recurring-donations', RecurringDonationViewSet)
router.register(r'donations', DonationViewSet)
router.register(r'activities', UserActivityViewSet)
router.register(r'rewards', RewardViewSet)
router.register(r'resource-categories', ResourceCategoryViewSet)
router.register(r'resources', EducationalResourceViewSet) 
router.register(r'resource-ratings', ResourceRatingViewSet)
router.register(r'redemptions', RewardRedemptionViewSet)
router.register(r'achievements', AchievementViewSet)
router.register(r'volunteer-profiles', VolunteerProfileViewSet)
router.register(r'volunteer-opportunities', VolunteerOpportunityViewSet)
router.register(r'volunteer-assignments', VolunteerAssignmentViewSet)
router.register(r'rescue-assignments', RescueVolunteerAssignmentViewSet, basename='rescueassignment')
router.register(r'volunteer-training', VolunteerTrainingProgressViewSet, basename='volunteertraining')
router.register(r'volunteer-certifications', VolunteerSkillCertificationViewSet, basename='volunteercertification')
router.register(r'volunteer-management', VolunteerManagementViewSet, basename='volunteermanagement')
router.register(r'virtual-adoption-levels', VirtualAdoptionLevelViewSet)
router.register(r'virtual-adoptions', VirtualAdoptionViewSet)
router.register(r'virtual-adoption-updates', VirtualAdoptionUpdateViewSet)
router.register('notifications', NotificationViewSet)
router.register(r'inventory-categories', ItemCategoryViewSet)
router.register(r'inventory-items', InventoryItemViewSet)
router.register(r'inventory-transactions', InventoryTransactionViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'purchases', PurchaseViewSet)
router.register(r'purchase-items', PurchaseItemViewSet)
router.register(r'inventory-analytics', InventoryAnalyticsViewSet, basename='inventory-analytics')
router.register(r'forum-categories', ForumCategoryViewSet)
router.register(r'forum-topics', ForumTopicViewSet, basename='forumtopic')
router.register(r'forum-posts', ForumPostViewSet, basename='forumpost')
router.register(r'knowledge-articles', KnowledgeArticleViewSet)
router.register(r'impact-dashboard', ImpactDashboardViewSet, basename='impact-dashboard')
router.register(r'predictive-analytics', PredictiveAnalyticsViewSet, basename='predictive-analytics')
router.register(r'authority-analytics', AuthorityAnalyticsViewSet, basename='authority-analytics')
router.register(r'mental-health-categories', MentalHealthCategoryViewSet, 
               basename='mental-health-category')
router.register(r'mental-health-resources', MentalHealthResourceViewSet,
               basename='mental-health-resource')
router.register(r'self-care-reminders', SelfCareReminderViewSet,
               basename='self-care-reminder')
router.register(r'stress-logs', StressLogEntryViewSet,
               basename='stress-log')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('api/login/', login_view, name='api_login'),
    path('api/setup-production-simple/', setup_production_simple, name='setup_production_simple'),
    path('api/import-data-simple/', import_data_simple, name='import_data_simple'), 
    path('api/dashboard/', include('dashboard.urls')),
    path('api/health/', include('health.urls')),
    path('api/resources/', include('resources.urls')),
    path('api/volunteers/', include('volunteers.urls')),
    path('api/reports/', include('reports.urls')), 
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
