from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.contrib.gis.geos import Point  # Import Point for GeoDjango
from django.contrib.auth import get_user_model
from rest_framework import serializers
import os
import uuid
import json
from .models import Report
from .serializers import ReportSerializer
from animals.models import Animal
from community.services import award_points

User = get_user_model()

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['description', 'location_details']
    ordering_fields = ['created_at']
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    
    def get_permissions(self):
        if self.action in ['create', 'track_report']:
            return [permissions.AllowAny()] 
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        try:
            # Extract location data from request
            lat = self.request.data.get('latitude')
            lng = self.request.data.get('longitude')
            
            print(f"Received location data: lat={lat}, lng={lng}")
            
            if not lat or not lng:
                raise serializers.ValidationError("Location coordinates are required")
            
            try:
                lat = float(lat)
                lng = float(lng)
            except (ValueError, TypeError):
                raise serializers.ValidationError("Invalid location coordinates")
            
            # Create Point for GeoDjango (longitude first, then latitude)
            geo_location = Point(lng, lat, srid=4326)
            location_json = {'lat': lat, 'lng': lng}
            
            print(f"Created geo_location: {geo_location}")

            reporter = self.request.user if self.request.user.is_authenticated else None
            
            # Save the report first
            report = serializer.save(
                 reporter=reporter,
                geo_location=geo_location,
                location_json=location_json
            )
            
            print(f"Report created with ID: {report.id}")
            
            # Create an animal associated with this report
            animal_data = {
                'animal_type': self.request.data.get('animal_type', 'DOG'),
                'gender': self.request.data.get('gender', 'UNKNOWN'),
                'color': self.request.data.get('color', ''),
                'status': 'REPORTED',
                'geo_location': geo_location,
                'last_location_json': location_json
            }
            
            animal = Animal.objects.create(**animal_data)
            print(f"Animal created with ID: {animal.id}")
            
            # Link the animal to the report
            report.animal = animal
            report.save()
            
            if reporter:
            	award_points(reporter, 'REPORT_ANIMAL', report)
            	if reporter.reports.count() == 1:
                    award_points(reporter, 'FIRST_REPORT', report)
            
            # Handle photos if they exist
            self._handle_report_photos(report)
            
            print(f"Report creation completed successfully")
            
        except Exception as e:
            print(f"Error in perform_create: {str(e)}")
            raise
    
    def update(self, request, *args, **kwargs):
        report = self.get_object()
        
        # Handle partial updates
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(report, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Handle photos if they exist
        self._handle_report_photos(report)
        
        return Response(serializer.data)
    
    def _handle_report_photos(self, report):
        """Process uploaded photos for a report"""
        request = self.request
        photo_urls = []

        # Log debugging information
        print(f"Processing photos for report #{report.id}")
        print(f"Request files: {list(request.FILES.keys())}")
        print(f"Request content type: {request.content_type}")

        # Check if there are files in the request
        for key, file in request.FILES.items():
            print(f"Processing file: {key} - {file.name}")
            
            try:
                # Generate a unique filename
                ext = os.path.splitext(file.name)[1]
                unique_filename = f"{uuid.uuid4()}{ext}"
            
                # Create directory structure for this report
                report_dir = f'reports/{report.id}'
                full_dir_path = os.path.join(settings.MEDIA_ROOT, report_dir)
                os.makedirs(full_dir_path, exist_ok=True)
            
                # Full file path
                file_path = os.path.join(full_dir_path, unique_filename)
            
                # Save the file
                with open(file_path, 'wb+') as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)
            
                # Save the path with proper media prefix
                photo_url = f"/media/{report_dir}/{unique_filename}"
                photo_urls.append(photo_url)
                print(f"Saved photo at: {photo_url}")
                
            except Exception as e:
                print(f"Error processing file {key}: {str(e)}")
                continue  # Skip this file and continue with others

        # Update the report with photo URLs if we have new photos
        if photo_urls:
            print(f"Adding {len(photo_urls)} photos to report")
            current_photos = report.photos or []
            report.photos = current_photos + photo_urls
            report.save()
            print(f"Updated report photos: {report.photos}")
        else:
            print("No photos to process")
    
    @action(detail=False, methods=['get'])
    def my_reports(self, request):
        """
        Get all reports submitted by the current user
        """
        try:
            # Get reports created by the current user, ordered by most recent first
            reports = Report.objects.filter(reporter=request.user).order_by('-created_at')
            
            # Serialize the reports
            serializer = ReportSerializer(reports, many=True)
            
            # Add additional computed fields for the frontend
            enriched_data = []
            for report_data in serializer.data:
                report = Report.objects.get(id=report_data['id'])
                
                # Add timeline information
                if hasattr(report, 'rescue_time') and report.rescue_time:
                    report_data['resolved_at'] = report.rescue_time
                
                # Add response notes if available
                if hasattr(report, 'rescue_notes') and report.rescue_notes:
                    report_data['response_notes'] = report.rescue_notes
                
                # Add urgency level (using status as proxy since urgency_level doesn't exist)
                report_data['urgency_level'] = 'high' if report.status == 'PENDING' else 'medium'
                
                # Add assigned volunteer info if available
                if report.assigned_to:
                    report_data['assigned_to_name'] = f"{report.assigned_to.first_name} {report.assigned_to.last_name}"
                
                enriched_data.append(report_data)
            
            return Response(enriched_data)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch reports: {str(e)}'}, 
                status=500
            )
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """
        Allow users to add additional notes to their own reports
        """
        report = self.get_object()
        
        # Check if user owns this report
        if report.reporter != request.user:
            return Response(
                {'error': 'You can only add notes to your own reports'}, 
                status=403
            )
        
        additional_notes = request.data.get('notes', '')
        if not additional_notes:
            return Response(
                {'error': 'Notes cannot be empty'}, 
                status=400
            )
        
        # Add notes to the description
        current_description = report.description or ''
        if current_description:
            report.description = f"{current_description}\n\nAdditional Info: {additional_notes}"
        else:
            report.description = f"Additional Info: {additional_notes}"
        
        report.save()
        
        return Response({
            'message': 'Additional information added successfully',
            'description': report.description
        })
    
    @action(detail=True, methods=['post'])
    def cancel_report(self, request, pk=None):
        """
        Allow users to cancel their own pending reports
        """
        report = self.get_object()
        
        # Check if user owns this report
        if report.reporter != request.user:
            return Response(
                {'error': 'You can only cancel your own reports'}, 
                status=403
            )
        
        # Only allow cancelling pending reports
        if report.status != 'PENDING':
            return Response(
                {'error': 'Only pending reports can be cancelled'}, 
                status=400
            )
        
        cancellation_reason = request.data.get('reason', 'Cancelled by reporter')
        
        report.status = 'CANCELLED'
        report.rescue_notes = f"Cancelled: {cancellation_reason}"
        report.save()
        
        return Response({
            'message': 'Report cancelled successfully',
            'status': report.status
        })
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        report = self.get_object()
        
        if report.status != 'PENDING':
            return Response({'detail': 'This report is already assigned or processed.'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        volunteer_id = request.data.get('volunteer_id')
        if not volunteer_id:
            return Response({'detail': 'Volunteer ID is required.'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        try:
            volunteer = User.objects.get(id=volunteer_id, user_type='VOLUNTEER')
        except User.DoesNotExist:
            return Response({'detail': 'Volunteer not found.'}, 
                           status=status.HTTP_404_NOT_FOUND)
        
        report.assigned_to = volunteer
        report.status = 'ASSIGNED'
        report.save()
        
        return Response(ReportSerializer(report).data)
    
    @action(detail=True, methods=['post'])
    
    def update_status(self, request, pk=None):
        report = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response({'detail': 'Status is required.'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        if new_status not in [s[0] for s in Report.STATUS_CHOICES]:
            return Response({'detail': 'Invalid status.'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Update report status
        report.status = new_status
        
        # If completed, update the rescue time and animal status
        if new_status == 'COMPLETED':
            report.rescue_time = timezone.now()
            if report.animal:
                report.animal.status = 'RESCUED'
                report.animal.save()
        
        # Add rescue notes if provided
        rescue_notes = request.data.get('rescue_notes')
        if rescue_notes:
            report.rescue_notes = rescue_notes
        
        report.save()

        if report.reporter:
            from notifications.services import create_notification
            status_display = dict(Report.STATUS_CHOICES)[new_status]
            create_notification(
                recipient=report.reporter,
                notification_type='REPORT_UPDATE',
                title=f"Report #{report.id} Status Updated",
                message=f"Your report has been updated to: {status_display}",
                related_object=report
            )
     
    @action(detail=False, methods=['get'], url_path='track/(?P<tracking_id>[^/.]+)', permission_classes=[permissions.AllowAny])

    def track_report(self, request, tracking_id=None):
        """
        Track a report by tracking ID or report ID
        Allows anonymous access for public tracking
        """
        try:
            # Try to find by tracking ID first
            if tracking_id.startswith('PWR-'):
                report = Report.objects.get(tracking_id=tracking_id)
            else:
                # Try to find by numeric ID
                try:
                    report_id = int(tracking_id.replace('#', ''))
                    report = Report.objects.get(id=report_id)
                except (ValueError, TypeError):
                    report = Report.objects.get(tracking_id=tracking_id)
        
            # Return public-safe data using the serializer
            serializer = ReportSerializer(report)
            data = serializer.data
        
            # Add assigned volunteer name (public info only)
            if report.assigned_to:
                data['assigned_to_name'] = f"{report.assigned_to.first_name} {report.assigned_to.last_name}".strip()
                if not data['assigned_to_name']:
                    data['assigned_to_name'] = "Rescue Volunteer"
        
            return Response(data)
        
        except Report.DoesNotExist:
            return Response(
                {'error': 'Report not found. Please check your tracking ID.'}, 
                status=404
            )
        except Exception as e:
            return Response(
                {'error': 'Unable to track report. Please try again later.'}, 
                status=500
            )

        return Response(ReportSerializer(report).data)
