from rest_framework import serializers
from .models import ChatRoom, Message, Reaction, CustomEmoji, Sticker
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class CustomEmojiSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomEmoji
        fields = ['id', 'name', 'image', 'is_public', 'created_at']
        read_only_fields = ['created_at']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)

class StickerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sticker
        fields = ['id', 'name', 'category', 'image', 'is_official']

class ReactionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    custom_emoji = CustomEmojiSerializer(read_only=True)
    
    class Meta:
        model = Reaction
        fields = ['id', 'user', 'emoji_type', 'emoji_code', 'custom_emoji', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.CharField(source='sender.id', read_only=True)
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    reactions = ReactionSerializer(many=True, read_only=True)
    reply_to = serializers.SerializerMethodField()
    sticker = StickerSerializer(read_only=True)
    custom_emoji = CustomEmojiSerializer(read_only=True)
    decrypted_content = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()  # 添加image_url字段
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender_id', 'sender_name', 'message_type', 'encrypted_content', 'decrypted_content',
            'image', 'image_url', 'sticker', 'custom_emoji', 'reply_to', 
            'timestamp', 'is_read', 'reactions'
        ]
        read_only_fields = ['sender_id', 'sender_name', 'timestamp']

    def get_decrypted_content(self, obj):
        # 暫時直接返回 encrypted_content（實際就是明文）
        return obj.encrypted_content
    
    def get_image_url(self, obj):
        """生成完整的圖片URL"""
        if obj.image:
            from django.conf import settings
            # 在開發環境中添加 localhost:8001
            base_url = "http://localhost:8001" if settings.DEBUG else ""
            return f"{base_url}{settings.MEDIA_URL}{obj.image.name}"
        return None

    def get_reply_to(self, obj):
        if obj.reply_to:
            return {
                'id': obj.reply_to.id,
                'sender_name': obj.reply_to.sender.name,
                'preview': obj.reply_to.encrypted_content[:50] + '...' if len(obj.reply_to.encrypted_content) > 50 else obj.reply_to.encrypted_content,
                'decrypted_content': obj.reply_to.encrypted_content,
                'encrypted_content': obj.reply_to.encrypted_content,
                'timestamp': obj.reply_to.timestamp
            }
        return None

class ChatRoomSerializer(serializers.ModelSerializer):
    doll1_name = serializers.CharField(source='doll1.name', read_only=True)
    doll2_name = serializers.CharField(source='doll2.name', read_only=True)
    doll1_id = serializers.CharField(source='doll1.id', read_only=True)
    doll2_id = serializers.CharField(source='doll2.id', read_only=True)
    latest_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'doll1_name', 'doll2_name', 'doll1_id', 'doll2_id', 'created_at', 'latest_message', 'unread_count']

    def get_latest_message(self, obj):
        latest = obj.messages.last()
        if latest:
            return MessageSerializer(latest).data
        return None

    def get_unread_count(self, obj):
        # 計算當前娃娃的未讀訊息數量
        # 需要從 request 的 query_params 中取得 doll_id
        request = self.context.get('request')
        if request:
            doll_id = request.query_params.get('doll_id')
            if doll_id:
                try:
                    from core.models import Doll
                    doll = Doll.objects.get(id=doll_id, username=request.user)
                    return obj.messages.filter(is_read=False).exclude(sender=doll).count()
                except Doll.DoesNotExist:
                    pass
        return 0

class ChatRoomCreateSerializer(serializers.ModelSerializer):
    doll1_id = serializers.CharField(write_only=True)
    doll2_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = ChatRoom
        fields = ['doll1_id', 'doll2_id']

    def validate(self, data):
        from core.models import Doll
        try:
            doll1 = Doll.objects.get(id=data['doll1_id'])
            doll2 = Doll.objects.get(id=data['doll2_id'])
            # 檢查用戶是否擁有這些娃娃
            user = self.context['request'].user
            if doll1.username != user or doll2.username != user:
                raise serializers.ValidationError("只能為自己的娃娃建立聊天室")
            return {'doll1': doll1, 'doll2': doll2}
        except Doll.DoesNotExist:
            raise serializers.ValidationError("娃娃不存在")

    def create(self, validated_data):
        doll1 = validated_data['doll1']
        doll2 = validated_data['doll2']
        
        # 檢查是否已存在聊天室（雙向檢查）
        existing_room = ChatRoom.objects.filter(
            models.Q(doll1=doll1, doll2=doll2) |
            models.Q(doll1=doll2, doll2=doll1)
        ).first()
        
        if existing_room:
            return existing_room
        
        # 建立新聊天室
        return ChatRoom.objects.create(
            doll1=doll1,
            doll2=doll2
        )
