from django.contrib import admin
from .models import StaffSchedule, StaffTask, StaffPerformance

@admin.register(StaffSchedule)
class StaffScheduleAdmin(admin.ModelAdmin):
    list_display = ['staff', 'duty_status', 'shift_start', 'shift_end']
    list_filter = ['duty_status']

@admin.register(StaffTask)
class StaffTaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'assigned_to', 'priority', 'status', 'due_date']
    list_filter = ['status', 'priority']

@admin.register(StaffPerformance)
class StaffPerformanceAdmin(admin.ModelAdmin):
    list_display = ['staff', 'performance_score', 'current_workload', 'tasks_completed_today']