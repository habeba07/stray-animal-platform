from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from .models import User
from .serializers import UserSerializer, UserRegistrationSerializer, LoginSerializer
from django.utils import timezone

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
