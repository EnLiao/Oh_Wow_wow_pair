from rest_framework import serializers
from django.contrib.auth import get_user_model
from core.models import User, Doll, Tag, Follow
from post.models import Post, Comment, Likes, Favorite, PostSeen
from notifications.models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    doll_name = serializers.CharField(source='doll.name', read_only=True)
    actor_name = serializers.CharField(source='actor.name', read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'type', 'doll', 'doll_name', 'actor', 'actor_name', 'target_id', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'type', 'doll', 'doll_name', 'actor', 'actor_name', 'target_id', 'content', 'created_at']