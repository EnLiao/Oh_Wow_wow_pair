import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .models import ChatRoom, Message, Reaction, CustomEmoji, Sticker
from django.core.files.base import ContentFile
import base64
from django.utils import timezone

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        
        # 從 query string 取得 token 和 doll_id
        query_string = self.scope.get('query_string', b'').decode()
        
        token = None
        doll_id = None
        
        # 使用 urllib.parse 來正確解析 URL 參數
        from urllib.parse import parse_qs, unquote
        params = parse_qs(query_string)
        
        if 'token' in params and params['token']:
            token = unquote(params['token'][0])
        if 'doll_id' in params and params['doll_id']:
            doll_id = unquote(params['doll_id'][0])
        
        # 驗證 token 並取得使用者
        user = await self.get_user_from_token(token)
        if not user:
            print(f"[WebSocket] 認證失敗：無效的 token")
            await self.close()
            return
            
        self.scope['user'] = user
        
        # 驗證並取得娃娃
        current_doll = await self.get_doll_from_id(doll_id, user)
        if not current_doll:
            print(f"[WebSocket] 娃娃驗證失敗: {doll_id}")
            await self.close()
            return
            
        self.scope['doll'] = current_doll
        
        # 驗證使用者權限（是否是聊天室的參與者）
        if not await self.verify_room_access():
            print(f"[WebSocket] 權限驗證失敗：用戶無權訪問聊天室 {self.room_id}")
            await self.close()
            return
        
        # 加入聊天室群組
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        print(f"[WebSocket] 用戶 {user.username} 的娃娃 {current_doll.name} 已加入聊天室 {self.room_id}")

    @database_sync_to_async
    def get_user_from_token(self, token):
        """從 JWT token 取得使用者"""
        if not token:
            return None
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            return User.objects.get(username=user_id)
        except (InvalidToken, TokenError, User.DoesNotExist):
            return None

    @database_sync_to_async
    def get_doll_from_id(self, doll_id, user):
        """從 doll_id 取得娃娃並驗證擁有權"""
        if not doll_id:
            return None
        try:
            from core.models import Doll
            return Doll.objects.get(id=doll_id, username=user)
        except Doll.DoesNotExist:
            return None

    async def disconnect(self, close_code):
        # 離開聊天室群組
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            print(f"[WebSocket] 收到消息: {data}")  
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'reaction':
                await self.handle_reaction(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
            elif message_type == 'read_receipt':
                await self.handle_read_receipt(data)
                
        except json.JSONDecodeError:
            print(f"[WebSocket] JSON 解析錯誤: {text_data}")  
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))
        except Exception as e:
            print(f"[WebSocket] 處理消息時發生錯誤: {e}")  
            import traceback
            traceback.print_exc()

    async def handle_chat_message(self, data):
        """處理聊天訊息"""
        print(f"[WebSocket] 處理聊天消息: {data}")  
        
        doll = self.scope["doll"]
        room = await self.get_room()
        
        print(f"[WebSocket] 發送者: {doll.name}, 聊天室: {room.id}")  
        print(f"[WebSocket] 接收到的數據: encrypted_content={data.get('encrypted_content')}, content={data.get('content')}")  
        
        # 建立訊息 - 優先使用 encrypted_content
        content = data.get('encrypted_content') or data.get('content', '')
        print(f"[WebSocket] 最終內容: {content}")  
        
        message_data = {
            'room': room,
            'sender': doll,
            'message_type': data.get('message_type', 'text'),
            'encrypted_content': content,
            'reply_to_id': data.get('reply_to_id'),
        }
        
        print(f"[WebSocket] reply_to_id: {data.get('reply_to_id')}")  
        
        # 處理不同類型的訊息
        if data.get('message_type') == 'image' and data.get('image_data'):
            # 處理 base64 圖片
            image_data = data['image_data']
            
            if ',' in image_data:
                format, imgstr = image_data.split(',', 1)
                
                try:
                    # 解碼 base64 圖片數據
                    decoded_image = base64.b64decode(imgstr)
                    image_file = ContentFile(decoded_image, name=f'chat_image_{timezone.now().timestamp()}.png')
                    message_data['image'] = image_file
                    # 圖片消息的 encrypted_content 設為空字串或圖片描述
                    message_data['encrypted_content'] = '[圖片]'
                except Exception as e:
                    print(f"[WebSocket] 圖片處理失敗: {e}")
                    return  # 如果圖片處理失敗，直接返回，不創建消息
            else:
                print(f"[WebSocket] 無效的圖片數據格式")
                return  # 如果圖片格式無效，直接返回，不創建消息
                
        elif data.get('message_type') == 'sticker' and data.get('sticker_id'):
            sticker = await self.get_sticker(data['sticker_id'])
            message_data['sticker'] = sticker
            
        elif data.get('message_type') == 'emoji' and data.get('custom_emoji_id'):
            custom_emoji = await self.get_custom_emoji(data['custom_emoji_id'])
            message_data['custom_emoji'] = custom_emoji
        
        message = await self.create_message(**message_data)
        print(f"[WebSocket] 消息已保存: ID={message.id}, 內容={message.encrypted_content}")  
        
        # 序列化消息
        serialized_message = await self.serialize_message(message)
        print(f"[WebSocket] 序列化后的消息: {serialized_message}")  
        
        # 發送給聊天室所有成員
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message_broadcast',
                'message': serialized_message
            }
        )

    async def handle_reaction(self, data):
        """處理表情符號反應"""
        doll = self.scope["doll"]
        message_id = data.get('message_id')
        emoji_code = data.get('emoji_code')
        emoji_type = data.get('emoji_type', 'standard')
        action = data.get('action', 'add')  # add 或 remove
        
        if action == 'add':
            reaction = await self.add_reaction(message_id, doll, emoji_code, emoji_type)
        else:
            await self.remove_reaction(message_id, doll, emoji_code)
            reaction = None
        
        # 廣播反應更新
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'reaction_update',
                'message_id': message_id,
                'emoji_code': emoji_code,
                'doll_id': doll.id,
                'action': action
            }
        )

    async def handle_typing(self, data):
        """處理輸入狀態"""
        doll = self.scope["doll"]
        is_typing = data.get('is_typing', False)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'doll_id': doll.id,
                'is_typing': is_typing
            }
        )

    async def handle_read_receipt(self, data):
        """處理已讀回條"""
        doll = self.scope["doll"]
        message_id = data.get('message_id')
        
        await self.mark_message_read(message_id, doll)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'read_receipt_update',
                'message_id': message_id,
                'doll_id': doll.id
            }
        )

    # WebSocket 事件處理器
    async def chat_message_broadcast(self, event):
        print(f"[WebSocket] 廣播消息: {event}")  
        response_data = {
            'type': 'chat_message',  # 修正事件類型
            'message': event['message']
        }
        print(f"[WebSocket] 發送到前端的數據: {response_data}")  
        await self.send(text_data=json.dumps(response_data))

    async def reaction_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'reaction_update',  # 保持一致
            'message_id': event['message_id'],
            'emoji_code': event['emoji_code'],
            'doll_id': event['doll_id'],
            'action': event['action']
        }))

    async def typing_indicator(self, event):
        # 不發送給自己
        if event['doll_id'] != self.scope["doll"].id:
            await self.send(text_data=json.dumps({
                'type': 'typing_indicator',  # 保持一致
                'doll_id': event['doll_id'],
                'is_typing': event['is_typing']
            }))

    async def read_receipt_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'read_receipt',
            'message_id': event['message_id'],
            'doll_id': event['doll_id']
        }))

    # 資料庫操作方法
    @database_sync_to_async
    def verify_room_access(self):
        """驗證使用者是否有權限進入聊天室"""
        user = self.scope["user"]
        if user.is_anonymous:
            return False
        
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            # 檢查用戶是否擁有聊天室中的任一娃娃
            return (room.doll1.username == user or room.doll2.username == user)
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def get_room(self):
        return ChatRoom.objects.get(id=self.room_id)

    @database_sync_to_async
    def create_message(self, **kwargs):
        print(f"[WebSocket] 準備創建訊息，參數: {list(kwargs.keys())}")  
        
        # 檢查是否有圖片
        if 'image' in kwargs:
            print(f"[WebSocket] 訊息包含圖片: {kwargs['image']}")  
        
        # 處理 reply_to_id
        reply_to_id = kwargs.pop('reply_to_id', None)
        if reply_to_id:
            try:
                reply_to_message = Message.objects.get(id=reply_to_id)
                kwargs['reply_to'] = reply_to_message
                print(f"[WebSocket] 設置回覆訊息: {reply_to_message.id}")  
            except Message.DoesNotExist:
                print(f"[WebSocket] 回覆訊息不存在: {reply_to_id}")  
        else:
            print(f"[WebSocket] 沒有回覆ID")  
        
        try:
            message = Message.objects.create(**kwargs)
            print(f"[WebSocket] 創建訊息成功: ID={message.id}, type={message.message_type}, reply_to={message.reply_to}")  
            
            # 如果是圖片消息，檢查圖片是否正確保存
            if message.image:
                print(f"[WebSocket] 圖片保存成功: {message.image.url}")  
            
            return message
        except Exception as e:
            print(f"[WebSocket] 創建訊息失敗: {e}")  
            import traceback
            traceback.print_exc()
            raise

    @database_sync_to_async
    def get_sticker(self, sticker_id):
        try:
            return Sticker.objects.get(id=sticker_id)
        except Sticker.DoesNotExist:
            return None

    @database_sync_to_async
    def get_custom_emoji(self, emoji_id):
        try:
            return CustomEmoji.objects.get(id=emoji_id)
        except CustomEmoji.DoesNotExist:
            return None

    @database_sync_to_async
    def add_reaction(self, message_id, doll, emoji_code, emoji_type):
        try:
            message = Message.objects.get(id=message_id)
            custom_emoji = None
            
            if emoji_type == 'custom':
                custom_emoji = CustomEmoji.objects.filter(
                    name=emoji_code.strip(':'), 
                    owner=doll.username
                ).first()
            
            reaction, created = Reaction.objects.get_or_create(
                message=message,
                doll=doll,
                emoji_code=emoji_code,
                defaults={
                    'emoji_type': emoji_type,
                    'custom_emoji': custom_emoji
                }
            )
            return reaction
        except Message.DoesNotExist:
            return None

    @database_sync_to_async
    def remove_reaction(self, message_id, doll, emoji_code):
        try:
            Reaction.objects.filter(
                message_id=message_id,
                doll=doll,
                emoji_code=emoji_code
            ).delete()
        except Exception:
            pass

    @database_sync_to_async
    def mark_message_read(self, message_id, doll):
        try:
            message = Message.objects.get(id=message_id)
            if message.sender != doll:  # 只有接收者可以標記已讀
                message.is_read = True
                message.save()
        except Message.DoesNotExist:
            pass

    @database_sync_to_async
    def serialize_message(self, message):
        """序列化訊息物件"""
        print(f"[WebSocket] 序列化訊息 ID={message.id}, reply_to={message.reply_to}")  
        
        # 重新從數據庫載入訊息以確保關聯對象被正確載入
        try:
            message = Message.objects.select_related('reply_to', 'reply_to__sender').get(id=message.id)
            print(f"[WebSocket] 重新載入後的 reply_to: {message.reply_to}")  
        except Message.DoesNotExist:
            print(f"[WebSocket] 無法重新載入訊息: {message.id}")  
        
        reply_to_data = None
        if message.reply_to:
            print(f"[WebSocket] 處理回覆訊息: {message.reply_to.id}")  
            # 包含完整的回覆訊息資訊
            reply_to_data = {
                'id': message.reply_to.id,
                'sender_name': message.reply_to.sender.name,
                'preview': message.reply_to.encrypted_content[:50] + '...' if len(message.reply_to.encrypted_content) > 50 else message.reply_to.encrypted_content,
                'decrypted_content': message.reply_to.encrypted_content,  # 暫時用於測試
                'encrypted_content': message.reply_to.encrypted_content
            }
            print(f"[WebSocket] reply_to_data: {reply_to_data}")  
        
        # 包含反應資訊
        reactions_data = []
        for reaction in message.reactions.all():
            reactions_data.append({
                'emoji_code': reaction.emoji_code,
                'doll_id': reaction.doll.id,
                'user': reaction.doll.name,
                'emoji_type': reaction.emoji_type
            })
        
        # 調試：檢查圖片URL
        image_url = None
        if message.image:
            # 構建完整的圖片URL（包含域名）
            from django.conf import settings
            # 在開發環境中添加 localhost:8001
            base_url = "http://localhost:8001" if settings.DEBUG else ""
            image_url = f"{base_url}{settings.MEDIA_URL}{message.image.name}"
            print(f"[WebSocket] 序列化時的圖片URL: {image_url}")  
            print(f"[WebSocket] 圖片文件名: {message.image.name}")  
        else:
            print(f"[WebSocket] 消息沒有圖片")  
        
        serialized_data = {
            'id': message.id,
            'sender_id': message.sender.id,  # 使用 doll.id
            'sender_name': message.sender.name,  # 添加 doll 名稱
            'message_type': message.message_type,
            'encrypted_content': message.encrypted_content,
            'decrypted_content': message.encrypted_content,  # 暫時用於測試（實際應該解密）
            'image_url': image_url,
            'sticker_id': message.sticker.id if message.sticker else None,
            'custom_emoji_id': message.custom_emoji.id if message.custom_emoji else None,
            'reply_to_id': message.reply_to.id if message.reply_to else None,
            'reply_to': reply_to_data,  # 添加完整的回覆訊息資訊
            'reactions': reactions_data,  # 添加反應資訊
            'timestamp': message.timestamp.isoformat(),
            'is_read': message.is_read
        }
        
        print(f"[WebSocket] 序列化完成的數據: {serialized_data}")  
        return serialized_data