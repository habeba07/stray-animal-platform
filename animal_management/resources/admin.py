from django.contrib import admin
from .models import ResourceCategory, EducationalResource, ResourceRating

@admin.register(ResourceCategory)
class ResourceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(EducationalResource)
class EducationalResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'resource_type', 'is_published', 'view_count')
    list_filter = ('resource_type', 'category', 'is_published')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'summary', 'content')

@admin.register(ResourceRating)
class ResourceRatingAdmin(admin.ModelAdmin):
    list_display = ('resource', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
