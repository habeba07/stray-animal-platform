from rest_framework import serializers
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
import uuid
from .models import User
from .models import User, TimeSheet

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type', 
                 'phone_number', 'address', 'organization_name', 'skills', 'points']
        read_only_fields = ['points']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 
                  'last_name', 'user_type', 'phone_number', 'address', 
                  'organization_name', 'skills']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
    
        # Create user normally
        user = User(**validated_data)
        user.set_password(password)
    
        # Set email verification fields explicitly after creation
        user.is_email_verified = False
        user.email_verification_token = str(uuid.uuid4())
        user.email_verification_sent_at = timezone.now()
    
        user.save()
    
        # Send verification email
        self.send_verification_email(user)
    
        return user


    def send_verification_email(self, user):
        """Send email verification email to user"""
        verification_url = f"http://localhost:3000/verify-email/{user.email_verification_token}/"
    
        subject = 'Verify your PAWRescue account'
        message = f"""
        Hi {user.first_name or user.username},
    
        Thank you for registering with PAWRescue!
    
        Please click the link below to verify your email address:
        {verification_url}
    
        This link will expire in 24 hours.
    
        If you didn't create an account, please ignore this email.
    
        Best regards,
        PAWRescue Team
        """
    
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )




class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'}, trim_whitespace=False)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
    
        if username and password:
            user = authenticate(request=self.context.get('request'),
                           username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
        
            # Check if email is verified
            if not user.is_email_verified:
                raise serializers.ValidationError(
                    'Please verify your email address before logging in. Check your email for the verification link.'
                )
        else:
            raise serializers.ValidationError('Must include username and password')
    
        data['user'] = user
        return data

class TimeSheetSerializer(serializers.ModelSerializer):
    staff_member_name = serializers.CharField(source='staff_member.get_full_name', read_only=True)
    is_clocked_in = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = TimeSheet
        fields = [
            'id', 'staff_member', 'staff_member_name', 'clock_in_time', 
            'clock_out_time', 'total_hours', 'notes', 'created_at', 
            'is_clocked_in'
        ]
        read_only_fields = ['id', 'total_hours', 'created_at']

class ClockInSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True, max_length=500)
    
    def validate(self, data):
        user = self.context['request'].user
        
        if user.user_type not in ['STAFF', 'SHELTER']:
            raise serializers.ValidationError("Only staff members can use time tracking.")
        
        active_shift = TimeSheet.objects.filter(
            staff_member=user,
            clock_out_time__isnull=True
        ).first()
        
        if active_shift:
            raise serializers.ValidationError("You are already clocked in. Please clock out first.")
        
        return data

class ClockOutSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True, max_length=500)
    
    def validate(self, data):
        user = self.context['request'].user
        
        if user.user_type not in ['STAFF', 'SHELTER']:
            raise serializers.ValidationError("Only staff members can use time tracking.")
        
        active_shift = TimeSheet.objects.filter(
            staff_member=user,
            clock_out_time__isnull=True
        ).first()
        
        if not active_shift:
            raise serializers.ValidationError("You are not currently clocked in.")
        
        data['active_shift'] = active_shift
        return data
