from django.contrib import admin
from .models import VaccinationRecord, MedicalRecord, HealthStatus

@admin.register(VaccinationRecord)
class VaccinationRecordAdmin(admin.ModelAdmin):
    list_display = ('animal', 'vaccine_type', 'date_administered', 'next_due_date', 'veterinarian')
    list_filter = ('vaccine_type', 'date_administered')
    search_fields = ('animal__name', 'veterinarian', 'clinic_name')

@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('animal', 'record_type', 'date', 'veterinarian', 'reason')
    list_filter = ('record_type', 'date')
    search_fields = ('animal__name', 'veterinarian', 'clinic_name', 'reason')

@admin.register(HealthStatus)
class HealthStatusAdmin(admin.ModelAdmin):
    list_display = ('animal', 'current_status', 'last_checkup_date', 'next_checkup_date')
    list_filter = ('current_status', 'last_checkup_date')
    search_fields = ('animal__name',)
