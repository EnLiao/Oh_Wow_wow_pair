from rest_framework import serializers
from django.contrib.auth import get_user_model
from core.models import User, Doll, Tag
from post.models import Post, Comment, Likes, Favorite, PostSeen
from core.serializers import DollSerializer, RegisterSerializer

class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'nickname', 'avatar_url']

class PostSerializer(serializers.ModelSerializer):
    doll_id = serializers.PrimaryKeyRelatedField(queryset=Doll.objects.all())
    like_count = serializers.SerializerMethodField()
    liked_by_me = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'doll_id', 'content', 'image', 'created_at', 'like_count', 'liked_by_me', 'comment_count']
        read_only_fields = ['id', 'created_at']

    def get_like_count(self, post_instance):
        return Likes.objects.filter(post_id=post_instance).count()

    def get_liked_by_me(self, post_instance):
        requesting_doll_id = self.context.get('doll_id')
        if not requesting_doll_id:
            return False
        return Likes.objects.filter(post_id=post_instance, doll_id=requesting_doll_id).exists()
    
    def get_comment_count(self, post_instance):
        return post_instance.comments.count()

class CommentSerializer(serializers.ModelSerializer):
    post_id = serializers.PrimaryKeyRelatedField(
        queryset=Post.objects.all(),
    )
    doll_id = serializers.PrimaryKeyRelatedField(
        queryset=Doll.objects.all(),
    )

    doll_name = serializers.CharField(source='doll_id.name', read_only=True)
    doll_avatar = serializers.SerializerMethodField()


    class Meta:
        model = Comment
        fields = ['local_id', 'post_id', 'doll_id','doll_avatar','content', 'created_at']
        read_only_fields = ['local_id', 'created_at']

    def get_doll_avatar(self, obj):
        if obj.doll_id and obj.doll_id.avatar_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.doll_id.avatar_image.url)
            return obj.doll_id.avatar_image.url
        return None
    
    def create(self, validated_data):
        comment = Comment.objects.create(**validated_data)
        return comment
    
    

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

class PostSeenSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostSeen
        fields = '__all__'
        read_only_fields = ['seen_at']