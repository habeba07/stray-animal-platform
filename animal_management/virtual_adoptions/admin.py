from django.contrib import admin
from .models import VirtualAdoption, VirtualAdoptionUpdate, VirtualAdoptionLevel

@admin.register(VirtualAdoptionLevel)
class VirtualAdoptionLevelAdmin(admin.ModelAdmin):
    list_display = ('name', 'amount', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')

@admin.register(VirtualAdoption)
class VirtualAdoptionAdmin(admin.ModelAdmin):
    list_display = ('sponsor', 'animal', 'amount', 'period', 'status', 'start_date', 'next_payment_date')
    list_filter = ('status', 'period', 'start_date')
    search_fields = ('sponsor__username', 'animal__name')
    date_hierarchy = 'start_date'

@admin.register(VirtualAdoptionUpdate)
class VirtualAdoptionUpdateAdmin(admin.ModelAdmin):
    list_display = ('virtual_adoption', 'title', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'content', 'virtual_adoption__animal__name')
    date_hierarchy = 'created_at'
