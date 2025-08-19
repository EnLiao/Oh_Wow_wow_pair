from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator

class ChatRoom(models.Model):
    doll1 = models.ForeignKey(
        'core.Doll', on_delete=models.CASCADE, related_name='chatrooms_as_doll1'
    )
    doll2 = models.ForeignKey(
        'core.Doll', on_delete=models.CASCADE, related_name='chatrooms_as_doll2'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    # 加密金鑰資訊（前端協商後的加密參數，後端不存明文金鑰）
    encryption_params = models.JSONField(default=dict, blank=True)

    class Meta:
        unique_together = ('doll1', 'doll2')

    def __str__(self):
        return f'Chat between {self.doll1} and {self.doll2}'


class CustomEmoji(models.Model):
    """自訂表情符號，類似 Discord"""
    name = models.CharField(max_length=50)  # 表情符號名稱，如 "mycat"
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='custom_emojis', null=True, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='custom_emojis')
    image = models.ImageField(
        upload_to='custom_emojis/', 
        validators=[FileExtensionValidator(allowed_extensions=['png', 'gif', 'jpg', 'jpeg'])]
    )
    is_public = models.BooleanField(default=False)  # 是否公開讓其他人使用
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('name', 'owner', 'room')

    def __str__(self):
        if self.room:
            return f':{self.name}: in Room {self.room.id} by {self.owner}'
        return f':{self.name}: by {self.owner}'


class Sticker(models.Model):
    """貼圖包，類似 IG/Message 貼圖"""
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, default='default')
    image = models.ImageField(
        upload_to='stickers/',
        validators=[FileExtensionValidator(allowed_extensions=['png', 'gif', 'jpg', 'jpeg'])]
    )
    is_official = models.BooleanField(default=True)  # 官方貼圖或使用者上傳
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Message(models.Model):
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('sticker', 'Sticker'),
        ('emoji', 'Custom Emoji'),
    ]

    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey('core.Doll', on_delete=models.CASCADE)
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES)
    
    # 加密內容（前端加密後的密文）
    encrypted_content = models.TextField(blank=True)  # 加密後的文字內容
    
    # 圖片和貼圖（這些不加密，因為是媒體檔案）
    image = models.ImageField(upload_to='chat_images/', blank=True, null=True)
    sticker = models.ForeignKey(Sticker, on_delete=models.SET_NULL, null=True, blank=True)
    custom_emoji = models.ForeignKey(CustomEmoji, on_delete=models.SET_NULL, null=True, blank=True)
    
    # 回覆功能
    reply_to = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # 訊息是否已讀
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f'Message from {self.sender} in Room {self.room.id}'


class Reaction(models.Model):
    """對訊息的表情符號反應"""
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    doll = models.ForeignKey('core.Doll', on_delete=models.CASCADE)
    
    # 可以是標準 emoji 或自訂 emoji
    emoji_type = models.CharField(max_length=10, choices=[('standard', 'Standard'), ('custom', 'Custom')], default='standard')
    emoji_code = models.CharField(max_length=100)  # 標準: "👍", 自訂: ":mycat:"
    custom_emoji = models.ForeignKey(CustomEmoji, on_delete=models.CASCADE, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('message', 'doll', 'emoji_code')

    def __str__(self):
        return f'{self.doll} reacted to Message {self.message.id} with {self.emoji_code}'