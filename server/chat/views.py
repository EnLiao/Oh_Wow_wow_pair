from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from core.models import Doll
from .models import ChatRoom, Message, CustomEmoji, Sticker
from .serializers import (
    ChatRoomSerializer, ChatRoomCreateSerializer, MessageSerializer,
    CustomEmojiSerializer, StickerSerializer
)

class ChatRoomViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ChatRoomCreateSerializer
        return ChatRoomSerializer
    
    def get_queryset(self):
        doll_id = self.request.query_params.get('doll_id')
        if doll_id:
            try:
                # Convert string to integer and verify the doll exists and belongs to the current user
                doll = Doll.objects.get(id=doll_id, username=self.request.user)
                return ChatRoom.objects.filter(
                    Q(doll1=doll) | Q(doll2=doll)
                ).order_by('-created_at')
            except (ValueError, Doll.DoesNotExist):
                # Invalid doll_id or doll doesn't belong to user
                return ChatRoom.objects.none()
        return ChatRoom.objects.none()

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """取得聊天室的訊息"""
        # 檢查 doll_id 參數
        doll_id = request.query_params.get('doll_id')
        if not doll_id:
            return Response({'error': 'doll_id parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # 驗證娃娃是否屬於當前用戶
            doll = Doll.objects.get(id=doll_id, username=request.user)
        except Doll.DoesNotExist:
            return Response({'error': 'Invalid doll_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 檢查聊天室是否存在且娃娃是參與者
        room = ChatRoom.objects.filter(
            Q(doll1=doll) | Q(doll2=doll),
            pk=pk
        ).first()
        
        if not room:
            return Response({'error': 'Chat room not found or access denied'}, status=status.HTTP_404_NOT_FOUND)
        
        messages = room.messages.all().order_by('timestamp')
        
        # 不使用分頁，直接返回所有消息
        serializer = MessageSerializer(messages, many=True)
        return Response({
            'results': serializer.data,
            'count': len(serializer.data)
        })

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """標記聊天室所有訊息為已讀"""
        doll_id = request.data.get('doll_id')
        
        if not doll_id:
            return Response({'error': 'doll_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify the doll belongs to the current user
            doll = Doll.objects.get(id=doll_id, username=request.user)
            
            # Get the chatroom directly, ensuring the doll is a participant
            room = ChatRoom.objects.filter(
                Q(doll1=doll) | Q(doll2=doll),
                pk=pk
            ).first()
            
            if not room:
                return Response({'error': 'Chat room not found or access denied'}, status=status.HTTP_404_NOT_FOUND)
            
            # 標記不是這個娃娃發送的訊息為已讀
            room.messages.exclude(sender=doll).update(is_read=True)
            
            return Response({'status': 'messages marked as read'})
        except Doll.DoesNotExist:
            return Response({'error': 'Invalid doll_id'}, status=status.HTTP_400_BAD_REQUEST)

class CustomEmojiViewSet(viewsets.ModelViewSet):
    serializer_class = CustomEmojiSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        room_id = self.request.query_params.get('room_id')
        
        if room_id:
            try:
                # 驗證用戶是否是聊天室成員
                room = ChatRoom.objects.get(id=room_id)
                # 檢查用戶是否通過任何娃娃參與此聊天室
                user_dolls = user.dolls.all()
                is_member = any(
                    doll == room.doll1 or doll == room.doll2 
                    for doll in user_dolls
                )
                if not is_member:
                    raise permissions.PermissionDenied("You are not a member of this chat room.")
                
                # 返回該聊天室的所有表情符號（不限制owner）
                return CustomEmoji.objects.filter(room_id=room_id)
            except ChatRoom.DoesNotExist:
                raise serializers.ValidationError("Invalid room_id")
        
        # 預設返回用戶的所有表情符號（無聊天室關聯）
        return CustomEmoji.objects.filter(owner=user, room__isnull=True)

    def perform_create(self, serializer):
        room_id = self.request.data.get('room_id')
        room = None
        if room_id:
            try:
                room = ChatRoom.objects.get(id=room_id)
                # 驗證用戶是否是聊天室成員
                user_dolls = self.request.user.dolls.all()
                is_member = any(
                    doll == room.doll1 or doll == room.doll2 
                    for doll in user_dolls
                )
                if not is_member:
                    raise permissions.PermissionDenied("You are not a member of this chat room.")
            except ChatRoom.DoesNotExist:
                raise serializers.ValidationError("Invalid room_id")

        # 在私人聊天室中，表情符號預設為公開（房間內所有成員可見）
        is_public = bool(room) if room else False
        emoji = serializer.save(owner=self.request.user, room=room, is_public=is_public)
        
        # 如果是聊天室表情符號，透過 WebSocket 通知其他成員
        if room:
            self.notify_emoji_update(room.id, 'emoji_created', emoji)

    def perform_destroy(self, instance):
        # 檢查刪除權限：任何聊天室成員都可以刪除聊天室中的表情符號
        user = self.request.user
        room_id = None
        
        if instance.room:
            # 聊天室表情符號：檢查用戶是否為聊天室成員
            room = instance.room
            room_id = room.id
            # 檢查用戶是否通過任何娃娃參與此聊天室
            user_dolls = user.dolls.all()
            is_member = any(
                doll == room.doll1 or doll == room.doll2 
                for doll in user_dolls
            )
            if not is_member:
                raise permissions.PermissionDenied("You are not a member of this chat room.")
        else:
            # 個人表情符號：只有擁有者可以刪除
            if instance.owner != user:
                raise permissions.PermissionDenied("You can only delete your own emojis.")
        
        # 保存表情符號信息用於通知
        emoji_data = {
            'id': instance.id,
            'name': instance.name,
        }
        
        instance.delete()
        
        # 如果是聊天室表情符號，透過 WebSocket 通知其他成員
        if room_id:
            self.notify_emoji_update(room_id, 'emoji_deleted', emoji_data)

    def notify_emoji_update(self, room_id, action, emoji_data):
        """透過 WebSocket 通知聊天室成員表情符號更新"""
        channel_layer = get_channel_layer()
        room_group_name = f'chat_{room_id}'
        
        # 如果 emoji_data 是模型實例，轉換為字典
        if hasattr(emoji_data, 'id'):
            emoji_data = {
                'id': emoji_data.id,
                'name': emoji_data.name,
                'image': emoji_data.image.url if emoji_data.image else None,
            }
        
        message_data = {
            'type': 'emoji_update',
            'action': action,  # 'emoji_created' 或 'emoji_deleted'
            'emoji': emoji_data,
            'room_id': room_id,
        }
        
        async_to_sync(channel_layer.group_send)(
            room_group_name,
            message_data
        )

class StickerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Sticker.objects.all()
    serializer_class = StickerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        category = self.request.query_params.get('category')
        queryset = Sticker.objects.all()
        
        if category:
            queryset = queryset.filter(category=category)
            
        return queryset.order_by('name')
