from django.contrib import admin
from .models import ResourceCategory, MentalHealthResource, SelfCareReminder, StressLogEntry

@admin.register(ResourceCategory)
class ResourceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'order']
    list_editable = ['order']
    ordering = ['order', 'name']

@admin.register(MentalHealthResource)
class MentalHealthResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'resource_type', 'is_featured', 'is_published']
    list_filter = ['category', 'resource_type', 'is_featured', 'is_published']
    search_fields = ['title', 'summary']
    list_editable = ['is_featured', 'is_published']
    prepopulated_fields = {'slug': ('title',)}

@admin.register(SelfCareReminder)
class SelfCareReminderAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'frequency', 'time_of_day', 'is_active']
    list_filter = ['frequency', 'is_active']
    search_fields = ['title', 'user__username']

@admin.register(StressLogEntry)
class StressLogEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'stress_level']
    list_filter = ['stress_level', 'date']
    search_fields = ['user__username']
    ordering = ['-date']