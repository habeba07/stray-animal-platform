from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import StaffSchedule, StaffTask, StaffPerformance
from .serializers import StaffScheduleSerializer, StaffTaskSerializer, StaffPerformanceSerializer
from django.contrib.auth import get_user_model
from users.models import TimeSheet

User = get_user_model()

class StaffScheduleViewSet(viewsets.ModelViewSet):
    queryset = StaffSchedule.objects.all()
    serializer_class = StaffScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def with_real_status(self, request):
        """Get staff with real duty status from TimeSheet"""
        staff_users = User.objects.filter(
            user_type__in=['STAFF', 'SHELTER', 'VOLUNTEER']
        )
        
        staff_data = []
        for user in staff_users:
            # Check if currently clocked in
            current_timesheet = TimeSheet.objects.filter(
                staff_member=user,
                clock_out_time__isnull=True
            ).first()
            
            is_on_duty = current_timesheet is not None
            
            staff_info = {
                'id': user.id,
                'username': user.username,
                'user_type': user.user_type,
                'duty_status': 'ON_DUTY' if is_on_duty else 'OFF_DUTY',
                'current_shift': None
            }
            
            if current_timesheet:
                hours_worked = 0
                if current_timesheet.clock_in_time:
                    time_diff = timezone.now() - current_timesheet.clock_in_time
                    hours_worked = time_diff.total_seconds() / 3600
                
                staff_info['current_shift'] = {
                    'clock_in_time': current_timesheet.clock_in_time,
                    'hours_worked': round(hours_worked, 1)
                }
            
            staff_data.append(staff_info)
        
        return Response(staff_data)
    
    @action(detail=True, methods=['post'])
    def toggle_duty(self, request, pk=None):
        schedule = self.get_object()
        if schedule.duty_status == 'ON_DUTY':
            schedule.duty_status = 'OFF_DUTY'
        else:
            schedule.duty_status = 'ON_DUTY'
        schedule.save()
        return Response(self.get_serializer(schedule).data)

    @action(detail=False, methods=['get'])
    def weekly_schedule(self, request):
        """Get weekly schedule for all staff"""
        from datetime import datetime, timedelta
    
        # Get current week dates
        today = datetime.now().date()
        week_start = today - timedelta(days=today.weekday())
    
        staff_users = User.objects.filter(user_type__in=['STAFF', 'SHELTER', 'VOLUNTEER'])
    
        weekly_data = []
        for user in staff_users:
            schedule, created = StaffSchedule.objects.get_or_create(
                staff=user,
                defaults={'duty_status': 'OFF_DUTY'}
            )
        
            weekly_data.append({
                'user_id': user.id,
                'username': user.username,
                'user_type': user.user_type,
                'shift_start': schedule.shift_start,
                'shift_end': schedule.shift_end,
                'duty_status': schedule.duty_status
            })
    
        return Response(weekly_data)

    @action(detail=True, methods=['post'])
    def assign_shift(self, request, pk=None):
        """Assign shift to staff member"""
        schedule = self.get_object()
        shift_start = request.data.get('shift_start')
        shift_end = request.data.get('shift_end')
    
        if shift_start and shift_end:
            from datetime import datetime
            schedule.shift_start = datetime.fromisoformat(shift_start)
            schedule.shift_end = datetime.fromisoformat(shift_end)
            schedule.duty_status = 'ON_DUTY'
            schedule.save()
    
        return Response(self.get_serializer(schedule).data)

class StaffTaskViewSet(viewsets.ModelViewSet):
    queryset = StaffTask.objects.all()
    serializer_class = StaffTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class StaffPerformanceViewSet(viewsets.ModelViewSet):
    queryset = StaffPerformance.objects.all()
    serializer_class = StaffPerformanceSerializer
    permission_classes = [permissions.IsAuthenticated]