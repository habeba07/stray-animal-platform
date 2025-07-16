from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from .models import User, TimeSheet
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer,
    TimeSheetSerializer, ClockInSerializer, ClockOutSerializer
)
from django.utils import timezone
from datetime import datetime, timedelta

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'verify_email', 'login']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'user_type': user.user_type
        })
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def verify_email(self, request):
        """Verify user email with token"""
        token = request.data.get('token')
    
        if not token:
            return Response({'error': 'Token is required'}, status=400)
    
        try:
            user = User.objects.get(email_verification_token=token)
        
            # Check if token is expired (24 hours)
            if user.email_verification_sent_at:
                from django.conf import settings
                from datetime import timedelta
                expiry_time = user.email_verification_sent_at + timedelta(seconds=settings.EMAIL_VERIFICATION_TIMEOUT)
            
                if timezone.now() > expiry_time:
                    return Response({'error': 'Verification link has expired'}, status=400)
        
            # Verify the email
            user.is_email_verified = True
            user.email_verification_token = None  # Clear the token
            user.save()
        
            return Response({'message': 'Email verified successfully!'})
        
        except User.DoesNotExist:
            return Response({'error': 'Invalid verification token'}, status=404)

    @action(detail=False, methods=['post'])
    def clock_in(self, request):
        serializer = ClockInSerializer(data=request.data, context={'request': request})
    
        if serializer.is_valid():
            timesheet = TimeSheet.objects.create(
                staff_member=request.user,
                clock_in_time=timezone.now(),
                notes=serializer.validated_data.get('notes', '')
            )
        
            return Response({
                'success': True,
                'message': 'Successfully clocked in',
                'timesheet': TimeSheetSerializer(timesheet).data
            }, status=status.HTTP_201_CREATED)
    
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def clock_out(self, request):
        serializer = ClockOutSerializer(data=request.data, context={'request': request})
    
        if serializer.is_valid():
            active_shift = serializer.validated_data['active_shift']
            active_shift.clock_out_time = timezone.now()
        
            new_notes = serializer.validated_data.get('notes', '')
            if new_notes:
                if active_shift.notes:
                    active_shift.notes += f"\nClock Out Notes: {new_notes}"
                else:
                    active_shift.notes = f"Clock Out Notes: {new_notes}"
        
            active_shift.save()
        
            return Response({
                'success': True,
                'message': 'Successfully clocked out',
                'timesheet': TimeSheetSerializer(active_shift).data
            }, status=status.HTTP_200_OK)
    
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=False, methods=['get'])
    def shift_status(self, request):
        user = request.user
    
        if user.user_type not in ['STAFF', 'SHELTER']:
            return Response({
                'error': 'Only staff members can access time tracking'
            }, status=status.HTTP_403_FORBIDDEN)
    
        active_shift = TimeSheet.objects.filter(
            staff_member=user,
            clock_out_time__isnull=True
        ).first()
    
        if active_shift:
            return Response({
                'is_clocked_in': True,
                'current_shift': TimeSheetSerializer(active_shift).data,
                'clock_in_time': active_shift.clock_in_time,
                'duration_minutes': int((timezone.now() - active_shift.clock_in_time).total_seconds() / 60)
            })
        else:
            return Response({
                'is_clocked_in': False,
                'current_shift': None
            })

    @action(detail=False, methods=['get'])
    def weekly_hours(self, request):
        user = request.user
    
        if user.user_type not in ['STAFF', 'SHELTER']:
            return Response({
                'error': 'Only staff members can access time tracking'
            }, status=status.HTTP_403_FORBIDDEN)
    
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
    
        week_shifts = TimeSheet.objects.filter(
            staff_member=user,
            clock_in_time__date__range=[week_start, week_end],
            clock_out_time__isnull=False
        )
    
        total_hours = sum(shift.total_hours or 0 for shift in week_shifts)
    
        return Response({
            'week_start': week_start,
            'week_end': week_end,
            'total_hours': round(total_hours, 2),
            'shifts_count': week_shifts.count(),
        })
