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
    doll_id = serializers.PrimaryKeyRelatedField(queryset=Doll.objects.all()) # 建議加上 source='doll' 如果模型欄位是 doll
    like_count = serializers.SerializerMethodField()
    liked_by_me = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'doll_id', 'content', 'image_url', 'created_at', 'like_count', 'liked_by_me']
        read_only_fields = ['id', 'created_at']

    def get_like_count(self, post_instance):
        # 'post_instance' 是一個 Post 物件
        # 這裡的 post_id 是 Likes 模型中的欄位名稱，查詢正確
        return Likes.objects.filter(post_id=post_instance).count()

    def get_liked_by_me(self, post_instance):
        # 'post_instance' 是一個 Post 物件
        requesting_doll_id = self.context.get('doll_id')
        if not requesting_doll_id:
            return False
        
        # 修正這裡：將 post=post_instance 改為 post_id=post_instance
        # 'post_id' 是 Likes 模型中指向 Post 的 ForeignKey 欄位名稱
        # 'doll_id' 是 Likes 模型中指向 Doll 的 ForeignKey 欄位名稱
        return Likes.objects.filter(post_id=post_instance, doll_id=requesting_doll_id).exists()


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

class PostSeenSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostSeen
        fields = '__all__'
        read_only_fields = ['seen_at']