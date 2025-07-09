from django.contrib import admin
from .models import AdopterProfile, AnimalBehaviorProfile, AdoptionApplication, AdoptionMatch

@admin.register(AdopterProfile)
class AdopterProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'housing_type', 'pet_experience', 'activity_level', 'created_at')
    list_filter = ('housing_type', 'pet_experience', 'activity_level')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(AnimalBehaviorProfile)
class AnimalBehaviorProfileAdmin(admin.ModelAdmin):
    list_display = ('animal', 'energy_level', 'temperament', 'training_level', 'created_at')
    list_filter = ('energy_level', 'temperament', 'training_level')
    search_fields = ('animal__name',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(AdoptionApplication)
class AdoptionApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'animal', 'status', 'compatibility_score', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('applicant__username', 'animal__name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(AdoptionMatch)
class AdoptionMatchAdmin(admin.ModelAdmin):
    list_display = ('adopter', 'animal', 'overall_score', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('adopter__username', 'animal__name')
    readonly_fields = ('created_at',)
