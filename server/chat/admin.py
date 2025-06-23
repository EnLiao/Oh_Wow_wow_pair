from django.contrib import admin
from .models import ChatRoom, Message, Reaction, CustomEmoji, Sticker

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'doll1', 'doll2', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('doll1__name', 'doll2__name')
    readonly_fields = ('created_at',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'room', 'message_type', 'timestamp', 'is_read')
    list_filter = ('message_type', 'timestamp', 'is_read')
    search_fields = ('sender__name', 'room__id')
    readonly_fields = ('timestamp',)
    
    # 不顯示加密內容，保護隱私
    exclude = ('encrypted_content',)

@admin.register(CustomEmoji)
class CustomEmojiAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'is_public', 'created_at')
    list_filter = ('is_public', 'created_at')
    search_fields = ('name', 'owner__username')
    readonly_fields = ('created_at',)

@admin.register(Sticker)
class StickerAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_official', 'created_at')
    list_filter = ('category', 'is_official', 'created_at')
    search_fields = ('name', 'category')
    readonly_fields = ('created_at',)

@admin.register(Reaction)
class ReactionAdmin(admin.ModelAdmin):
    list_display = ('message', 'doll', 'emoji_type', 'emoji_code', 'created_at')
    list_filter = ('emoji_type', 'created_at')
    search_fields = ('doll__name', 'emoji_code')
    readonly_fields = ('created_at',)
