from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
User = get_user_model()
from .models import Animal
from .serializers import AnimalSerializer
from django.db.models import Q
import os
import uuid
from django.utils import timezone
from django.conf import settings

class AnimalPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class AnimalViewSet(viewsets.ModelViewSet):
    queryset = Animal.objects.all()
    serializer_class = AnimalSerializer
    pagination_class = AnimalPagination  # Add pagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['animal_type', 'gender', 'vaccinated', 'neutered_spayed']
    search_fields = ['name', 'breed', 'color']
    ordering_fields = ['created_at', 'intake_date']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'adoptable']:
            return [permissions.AllowAny()] 
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Animal.objects.all()
        
        # Handle comma-separated status filtering
        status_param = self.request.query_params.get('status', None)
        if status_param:
            statuses = [s.strip() for s in status_param.split(',')]
            queryset = queryset.filter(status__in=statuses)
            
        # Handle priority filtering
        priority_param = self.request.query_params.get('priority', None)
        if priority_param:
            priorities = [p.strip() for p in priority_param.split(',')]
            queryset = queryset.filter(priority_level__in=priorities)
            
        # Apply other filters
        for field in ['animal_type', 'gender', 'vaccinated', 'neutered_spayed']:
            value = self.request.query_params.get(field, None)
            if value:
                queryset = queryset.filter(**{field: value})
                
        return queryset
    
    @action(detail=False, methods=['get'])
    def adoptable(self, request):
        adoptable = self.queryset.filter(status='AVAILABLE')
        serializer = self.get_serializer(adoptable, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_animals(self, request):
        """Get animals assigned to current staff member"""
        user = request.user
    
        if user.user_type not in ['STAFF', 'SHELTER']:
            return Response({
                'error': 'Only staff members can access assigned animals'
            }, status=status.HTTP_403_FORBIDDEN)
    
        # Filter animals assigned to current user
        assigned_animals = self.get_queryset().filter(current_shelter=user)
    
        # Apply any additional filters
        queryset = self.filter_queryset(assigned_animals)
    
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
    
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def assign_to_me(self, request, pk=None):
        """Assign animal to current staff member"""
        user = request.user
    
        if user.user_type not in ['STAFF', 'SHELTER']:
            return Response({
                'error': 'Only staff members can assign animals'
            }, status=status.HTTP_403_FORBIDDEN)
    
        animal = self.get_object()
    
        # Check if animal is already assigned
        if animal.current_shelter and animal.current_shelter != user:
            return Response({
                'error': f'Animal is already assigned to {animal.current_shelter.username}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
        # Assign animal to current user
        animal.current_shelter = user
        animal.save()
    
        return Response({
            'success': True,
            'message': f'Animal assigned to {user.username}',
            'animal': self.get_serializer(animal).data
        })

    @action(detail=True, methods=['post'])
    def unassign(self, request, pk=None):
        """Remove assignment from animal"""
        user = request.user
    
        if user.user_type not in ['STAFF', 'SHELTER']:
            return Response({
                'error': 'Only staff members can unassign animals'
            }, status=status.HTTP_403_FORBIDDEN)
    
        animal = self.get_object()
    
        # Only allow unassigning if assigned to current user or if user is admin
        if animal.current_shelter != user and not user.is_staff:
            return Response({
                'error': 'You can only unassign animals assigned to you'
            }, status=status.HTTP_403_FORBIDDEN)
    
        animal.current_shelter = None
        animal.save()
    
        return Response({
            'success': True,
            'message': 'Animal unassigned',
            'animal': self.get_serializer(animal).data
        })

    @action(detail=True, methods=['post'])
    def upload_photo(self, request, pk=None):
        """Upload photo for animal"""
        animal = self.get_object()
        
        if 'photo' not in request.FILES:
            return Response({'error': 'No photo file provided'}, status=400)
        
        photo_file = request.FILES['photo']
        
        # Create animal photo directory
        animal_dir = f'animals/{animal.id}/photos'
        full_dir_path = os.path.join(settings.MEDIA_ROOT, animal_dir)
        os.makedirs(full_dir_path, exist_ok=True)
        
        # Generate unique filename
        ext = os.path.splitext(photo_file.name)[1]
        unique_filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(full_dir_path, unique_filename)
        
        # Save file
        with open(file_path, 'wb+') as destination:
            for chunk in photo_file.chunks():
                destination.write(chunk)
        
        # Add to animal photos
        photo_url = f"/media/{animal_dir}/{unique_filename}"
        if not animal.photos:
            animal.photos = []
        animal.photos.append(photo_url)
        animal.save()
        
        return Response({
            'success': True,
            'photo_url': photo_url,
            'total_photos': len(animal.photos)
        })

    @action(detail=True, methods=['post'])
    def upload_document(self, request, pk=None):
        """Upload document for animal"""
        animal = self.get_object()
        
        if 'document' not in request.FILES:
            return Response({'error': 'No document file provided'}, status=400)
        
        document_file = request.FILES['document']
        document_type = request.data.get('document_type', 'medical')
        description = request.data.get('description', '')
        
        # Create animal document directory
        animal_dir = f'animals/{animal.id}/documents'
        full_dir_path = os.path.join(settings.MEDIA_ROOT, animal_dir)
        os.makedirs(full_dir_path, exist_ok=True)
        
        # Generate unique filename
        ext = os.path.splitext(document_file.name)[1]
        unique_filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(full_dir_path, unique_filename)
        
        # Save file
        with open(file_path, 'wb+') as destination:
            for chunk in document_file.chunks():
                destination.write(chunk)
        
        # Add to animal documents
        document_url = f"/media/{animal_dir}/{unique_filename}"
        document_entry = {
            'url': document_url,
            'filename': document_file.name,
            'type': document_type,
            'description': description,
            'uploaded_at': timezone.now().isoformat()
        }
        
        if not animal.documents:
            animal.documents = []
        animal.documents.append(document_entry)
        animal.save()
        
        return Response({
            'success': True,
            'document': document_entry,
            'total_documents': len(animal.documents)
        })


    @action(detail=False, methods=['get'])
    def ready_for_transfer(self, request):
        """Get animals that are ready for transfer"""
        animals = Animal.objects.filter(
            status='READY_FOR_TRANSFER'
        ).select_related('current_shelter')
    
        serializer = self.get_serializer(animals, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_transfer(self, request):
        """Transfer multiple animals to a new shelter"""
        animal_ids = request.data.get('animal_ids', [])
        new_shelter_id = request.data.get('new_shelter_id')
        transfer_date = request.data.get('transfer_date')
        notes = request.data.get('notes', '')
    
        if not animal_ids or not new_shelter_id:
            return Response(
                {'error': 'Animal IDs and new shelter ID are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
        try:
            new_shelter = User.objects.get(id=new_shelter_id, user_type__in=['SHELTER', 'STAFF'])
            animals = Animal.objects.filter(id__in=animal_ids)
        
            updated_count = 0
            for animal in animals:
                animal.current_shelter = new_shelter
                animal.status = 'IN_SHELTER'
                animal.transfer_ready_date = None
                animal.save()
                updated_count += 1
            
                # Log the transfer activity
                from community.models import UserActivity
                UserActivity.objects.create(
                    user=request.user,
                    activity_type='ANIMAL_TRANSFER',
                    description=f'Transferred {animal.name or "Unnamed"} to {new_shelter.get_full_name()}',
                    points_earned=10,
                )
        
            return Response({
                'success': True,
                'message': f'Successfully transferred {updated_count} animals',
                'transferred_count': updated_count
            })
        
        except User.DoesNotExist:
            return Response(
                {'error': 'New shelter not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def mark_ready_for_transfer(self, request, pk=None):
        """Mark an animal as ready for transfer"""
        animal = self.get_object()
        transfer_date = request.data.get('transfer_date')
        notes = request.data.get('notes', '')
    
        animal.status = 'READY_FOR_TRANSFER'
        if transfer_date:
            animal.transfer_ready_date = transfer_date
        animal.special_instructions = notes
        animal.save()
    
        # Log the activity
        from community.models import UserActivity
        UserActivity.objects.create(
            user=request.user,
            activity_type='ANIMAL_STATUS_UPDATE',
            description=f'Marked {animal.name or "Unnamed"} as ready for transfer',
            points_earned=5,
        )
    
        serializer = self.get_serializer(animal)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def transfer_to_shelter(self, request, pk=None):
        """Transfer individual animal to another shelter"""
        animal = self.get_object()
        new_shelter_id = request.data.get('new_shelter_id')
        notes = request.data.get('notes', '')
    
        if not new_shelter_id:
            return Response(
                {'error': 'New shelter ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
        try:
            new_shelter = User.objects.get(id=new_shelter_id, user_type__in=['SHELTER', 'STAFF'])
            old_shelter = animal.current_shelter
        
            animal.current_shelter = new_shelter
            animal.status = 'IN_SHELTER'
            animal.transfer_ready_date = None
            if notes:
                animal.special_instructions = notes
            animal.save()
        
            # Log the transfer activity
            from community.models import UserActivity
            UserActivity.objects.create(
                user=request.user,
                activity_type='ANIMAL_TRANSFER',
                description=f'Transferred {animal.name or "Unnamed"} from {old_shelter.get_full_name() if old_shelter else "Unassigned"} to {new_shelter.get_full_name()}',
                points_earned=10,
            )
        
            serializer = self.get_serializer(animal)
            return Response(serializer.data)
        
        except User.DoesNotExist:
            return Response(
                {'error': 'New shelter not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def bulk_update_status(self, request):
        """Bulk update status for multiple animals"""
        animal_ids = request.data.get('animal_ids', [])
        new_status = request.data.get('status')
    
        if not animal_ids or not new_status:
            return Response(
                {'error': 'Animal IDs and status are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
        animals = Animal.objects.filter(id__in=animal_ids)
        updated_count = animals.update(status=new_status)
    
        # Log the activity for each animal
        from community.models import UserActivity
        for animal in animals:
            UserActivity.objects.create(
                user=request.user,
                activity_type='ANIMAL_STATUS_UPDATE',
                description=f'Updated {animal.name or "Unnamed"} status to {new_status}',
                points_earned=3,
            )
    
        return Response({
            'success': True,
            'message': f'Successfully updated {updated_count} animals',
            'updated_count': updated_count
        })

    @action(detail=False, methods=['get'])
    def available_shelters(self, request):
        """Get list of available shelters for transfers"""
        shelters = User.objects.filter(
            user_type__in=['SHELTER', 'STAFF']
        ).values('id', 'username', 'first_name', 'last_name', 'organization_name')
    
        return Response(list(shelters))