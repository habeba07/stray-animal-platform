from .models import Notification
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def create_notification(recipient, notification_type, title, message, related_object=None):
    """
    Create a notification for a user
    
    Parameters:
    - recipient: User object
    - notification_type: String matching one of the NOTIFICATION_TYPES
    - title: Notification title
    - message: Notification message
    - related_object: Optional related object (report, adoption, etc.)
    """
    notification = Notification(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message
    )
    
    if related_object:
        notification.related_object_id = related_object.id
        notification.related_object_type = related_object.__class__.__name__.lower()
    
    notification.save()
    return notification

def send_emergency_notification_to_volunteers(rescue_report, message_type="EMERGENCY_RESCUE"):
    """Send emergency notifications to all available volunteers"""
    from django.contrib.auth import get_user_model
    from volunteers.models import VolunteerProfile
    
    User = get_user_model()
    channel_layer = get_channel_layer()
    
    # Get all available volunteers
    available_volunteers = VolunteerProfile.objects.filter(
        available_for_emergency=True,
        gps_tracking_consent=True,
        user__is_active=True
    ).select_related('user')
    
    notification_count = 0
    
    for volunteer_profile in available_volunteers:
        volunteer = volunteer_profile.user
        
        # Create database notification
        notification = create_notification(
            recipient=volunteer,
            notification_type=message_type,
            title=f"🚨 EMERGENCY: {rescue_report.animal_type} Rescue Needed",
            message=f"Emergency rescue in {getattr(rescue_report, 'location_details', 'unknown location')}. Immediate response needed!",
            related_object=rescue_report
        )
        
        # Send real-time WebSocket notification
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"notifications_{volunteer.id}",
                {
                    "type": "emergency_notification",
                    "message": {
                        "id": notification.id,
                        "title": notification.title,
                        "body": notification.message,
                        "type": message_type,
                        "rescue_id": rescue_report.id,
                        "urgency": getattr(rescue_report, 'urgency_level', 'HIGH'),
                        "location": getattr(rescue_report, 'location_details', ''),
                        "animal_type": rescue_report.animal_type,
                        "created_at": notification.created_at.isoformat()
                    },
                    "urgency": getattr(rescue_report, 'urgency_level', 'HIGH'),
                    "rescue_id": rescue_report.id
                }
            )
        
        notification_count += 1
    
    print(f"📢 Emergency notification sent to {notification_count} volunteers")
    return notification_count

def send_emergency_broadcast(message, urgency="HIGH"):
    """Send emergency broadcast to all volunteers"""
    channel_layer = get_channel_layer()
    
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            "emergency_volunteers",
            {
                "type": "emergency_notification",
                "message": {
                    "title": "🚨 EMERGENCY BROADCAST",
                    "body": message,
                    "type": "EMERGENCY_UPDATE",
                    "urgency": urgency,
                    "broadcast": True
                },
                "urgency": urgency
            }
        )
