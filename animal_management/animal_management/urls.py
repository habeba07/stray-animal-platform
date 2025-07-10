from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from django.http import HttpResponse
import json


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

# from animals.views import setup_production_simple, import_data_simple, import_core_data

from django.http import JsonResponse
from django.contrib.auth import get_user_model


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

def create_admin(request):
    User = get_user_model()
    
    # Check if admin already exists
    if User.objects.filter(username='admin').exists():
        return JsonResponse({'message': 'Admin user already exists'})
    
    try:
        # Create admin user
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@pawrescue.com',
            password='PawRescue2025!',
            user_type='STAFF',
            is_staff=True,
            is_superuser=True,
            is_email_verified=True
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Admin user created successfully!',
            'username': 'admin',
            'password': 'PawRescue2025!'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

# Add this function before urlpatterns
def fix_admin(request):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        # Find the admin user
        admin_user = User.objects.filter(username='admin').first()
        
        if not admin_user:
            return JsonResponse({'error': 'No admin user found'})
        
        # Check current status
        current_status = {
            'username': admin_user.username,
            'is_staff': admin_user.is_staff,
            'is_superuser': admin_user.is_superuser,
            'is_active': admin_user.is_active,
            'user_type': admin_user.user_type,
        }
        
        # Fix the admin user
        admin_user.set_password('PawRescue2025!')
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.user_type = 'STAFF'
        admin_user.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Admin user fixed!',
            'before': current_status,
            'credentials': {
                'username': 'admin',
                'password': 'PawRescue2025!'
            }
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def test_login(request):
    from django.contrib.auth import authenticate
    from django.contrib.auth import get_user_model
    
    try:
        User = get_user_model()
        
        # Test authentication
        user = authenticate(username='admin', password='PawRescue2025!')
        
        if user:
            return JsonResponse({
                'success': True,
                'message': 'Authentication works!',
                'user_id': user.id,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Authentication failed',
                'debug': {
                    'user_exists': User.objects.filter(username='admin').exists(),
                    'user_count': User.objects.count()
                }
            })
            
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def data_audit(request):
    from django.apps import apps
    from django.db import models
    
    # Check what's actually in the database first
    current_data = {}
    imported_total = 0
    
    # Get all current data with proper model names
    for model in apps.get_models():
        if hasattr(model, 'objects'):
            app_label = model._meta.app_label
            model_name = model._meta.model_name  # This is lowercase
            full_name = f"{app_label}.{model_name}"
            try:
                current_count = model.objects.count()
                if current_count > 0:
                    current_data[full_name] = current_count
                    imported_total += current_count
            except:
                pass
    
    # Also check animals specifically since we know they exist
    try:
        from animals.models import Animal
        animal_count = Animal.objects.count()
        if animal_count > 0:
            current_data['animals.animal'] = animal_count
    except:
        pass
        
    # Check users specifically  
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user_count = User.objects.count()
        if user_count > 0:
            current_data['users.user'] = user_count
    except:
        pass
    
    return HttpResponse(json.dumps({
        'imported_total': imported_total,
        'current_data': current_data,
        'top_models_by_count': dict(sorted(current_data.items(), key=lambda x: x[1], reverse=True)[:20])
    }, indent=2), content_type='application/json')


def import_missing_data(request):
    from django.core import serializers
    import glob
    import os
    
    try:
        # Look for export data
        export_dirs = glob.glob('data_export_*')
        if not export_dirs:
            return JsonResponse({'success': False, 'message': 'No export data found'})
        
        export_dir = sorted(export_dirs)[-1]
        
        # Models that are missing (in dependency order)
        missing_files = [
            # Healthcare first (independent)
            'healthcare_VaccinationRecord.json',
            'healthcare_MedicalRecord.json', 
            'healthcare_MedicalSupplyUsage.json',
            'healthcare_HealthStatus.json',
            
            # Adoptions (depends on animals/users - already imported)
            'adoptions_AdopterProfile.json',
            'adoptions_AnimalBehaviorProfile.json',
            'adoptions_AdoptionApplication.json',
            
            # Donations (independent)
            'donations_DonationCampaign.json',
            'donations_ImpactCategory.json',
            'donations_Donation.json',
            'donations_DonationImpact.json',
            'donations_SuccessStory.json',
            'donations_DonorImpactSummary.json',
            'donations_RecurringDonation.json',
            
            # Community (depends on users - already imported)
            'community_UserActivity.json',
            'community_Reward.json',
            'community_Achievement.json',
            'community_UserAchievement.json',
            'community_RewardRedemption.json',
            'community_ForumCategory.json',
            'community_ForumTopic.json',
            'community_ForumPost.json',
            'community_KnowledgeArticle.json',
            
            # Volunteers (depends on users - already imported)
            'volunteers_VolunteerProfile.json',
            'volunteers_VolunteerOpportunity.json',
            'volunteers_VolunteerAssignment.json',
            'volunteers_RescueVolunteerAssignment.json',
        ]
        
        imported_counts = {}
        
        for filename in missing_files:
            filepath = f"{export_dir}/{filename}"
            if os.path.exists(filepath):
                try:
                    with open(filepath, 'r') as f:
                        objects = serializers.deserialize('json', f.read())
                        count = 0
                        for obj in objects:
                            obj.save()
                            count += 1
                        imported_counts[filename] = count
                except Exception as e:
                    imported_counts[filename] = f"Error: {str(e)}"
            else:
                imported_counts[filename] = "File not found"
        
        return JsonResponse({
            'success': True,
            'message': 'Missing data import completed!',
            'imported': imported_counts
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Import failed: {str(e)}'})



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/create-admin/', create_admin, name='create_admin'), 
    path('api/fix-admin/', fix_admin, name='fix_admin'), 
    path('api/test-login/', test_login, name='test_login'), 
    path('api/data-audit/', data_audit, name='data_audit'),
    path('api/import-missing-data/', import_missing_data, name='import_missing_data'),
    path('api-auth/', include('rest_framework.urls')),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('api/login/', login_view, name='api_login'),
    # path('api/setup-production-simple/', setup_production_simple, name='setup_production_simple'),
    # path('api/import-data-simple/', import_data_simple, name='import_data_simple'), 
    # path('api/import-core-data/', import_core_data, name='import_core_data'),
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
