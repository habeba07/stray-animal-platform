import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("🔗 WebSocket attempting to connect...")
        try:
            self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
            self.group_name = f"notifications_{self.user_id}"
            print(f"👤 User ID: {self.user_id}")
            
            # Join group
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
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
        except:
            pass

    async def receive(self, text_data):
        print(f"📨 Received: {text_data}")

    async def notification_message(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps({"message": message}))
