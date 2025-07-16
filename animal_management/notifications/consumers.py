import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("🔗 WebSocket attempting to connect...")
        try:
            self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
            self.group_name = f"notifications_{self.user_id}"
            print(f"👤 User ID: {self.user_id}")
            
            # Join user-specific group
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            
            # Join emergency group if user is volunteer (move get_user_model inside method)
            try:
                User = get_user_model()  # Move this INSIDE the method
                user = await User.objects.aget(id=self.user_id)
                if user.user_type == 'VOLUNTEER':
                    self.emergency_group = "emergency_volunteers"
                    await self.channel_layer.group_add(
                        self.emergency_group,
                        self.channel_name
                    )
                    print(f"✅ Added to emergency volunteer group")
            except Exception as user_error:
                print(f"⚠️ Could not add to emergency group: {user_error}")
                pass
            
            print("✅ Added to group successfully")
            await self.accept()
            print("✅ WebSocket connection accepted")
        except Exception as e:
            print(f"❌ Error in connect: {e}")
            await self.close()

    async def disconnect(self, close_code):
        print(f"🔌 WebSocket disconnected with code: {close_code}")
        try:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            
            # Remove from emergency group if applicable
            if hasattr(self, 'emergency_group'):
                await self.channel_layer.group_discard(
                    self.emergency_group,
                    self.channel_name
                )
        except:
            pass

    async def receive(self, text_data):
        print(f"📨 Received: {text_data}")

    # Handle regular notifications
    async def notification_message(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps({
            "type": "notification",
            "message": message
        }))

    # Handle emergency notifications
    async def emergency_notification(self, event):
        print(f"🚨 Emergency notification: {event}")
        message = event["message"]
        await self.send(text_data=json.dumps({
            "type": "emergency",
            "message": message,
            "urgency": event.get("urgency", "HIGH"),
            "rescue_id": event.get("rescue_id"),
            "sound": True,  # Trigger sound alert
            "vibrate": True  # Trigger vibration on mobile
        }))