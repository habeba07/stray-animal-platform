from .models import Notification

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
