import os
import django
import asyncio
import json

# Configure Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "animal_management.settings")
django.setup()

from channels.layers import get_channel_layer

async def test_notification():
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        "notifications_1",  # Group for user ID 1
        {
            "type": "notification_message", 
            "message": {
                "title": "New Animal Report!",
                "body": "A stray dog was reported near Main Street",
                "type": "animal_report"
            }
        }
    )
    print("Test notification sent!")

if __name__ == "__main__":
    asyncio.run(test_notification())
