from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatRoomViewSet, CustomEmojiViewSet, StickerViewSet

router = DefaultRouter()
router.register(r'rooms', ChatRoomViewSet, basename='chatroom')
router.register(r'emojis', CustomEmojiViewSet, basename='customemoji')
router.register(r'stickers', StickerViewSet, basename='sticker')

urlpatterns = [
    path('', include(router.urls)),
]
