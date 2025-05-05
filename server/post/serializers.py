from rest_framework import serializers
from django.contrib.auth import get_user_model
from core.models import User, Doll, Tag, DollTag
from post.models import Post, Comment, Likes, Favorite
from core.serializers import DollSerializer, RegisterSerializer

class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'nickname', 'avatar_url']

class PostSerializer(serializers.ModelSerializer):
    doll_id = serializers.PrimaryKeyRelatedField(queryset=Doll.objects.all())
    class Meta:
        model = Post
        fields =  ['id', 'doll', 'content', 'image_url', 'created_at']

class CommentSerializer(serializers.ModelSerializer):
    doll_id = serializers.PrimaryKeyRelatedField(queryset=Doll.objects.all())
    post_id = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all())
    class Meta:
        model = Comment
        fields = '__all__'

class LikesSerializer(serializers.ModelSerializer):
    doll_id = serializers.PrimaryKeyRelatedField(queryset=Doll.objects.all())
    post_id = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all())
    class Meta:
        model = Likes
        fields = '__all__'

class FavoriteSerializer(serializers.ModelSerializer):
    doll_id = serializers.PrimaryKeyRelatedField(queryset=Doll.objects.all())
    post_id = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all())
    class Meta:
        model = Favorite
        fields = '__all__'