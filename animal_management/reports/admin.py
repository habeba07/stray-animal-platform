from django.contrib import admin
from .models import Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'reporter', 'animal', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('description', 'location_details')
    readonly_fields = ('created_at', 'updated_at')

