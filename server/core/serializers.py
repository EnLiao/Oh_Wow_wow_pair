from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Doll, Tag, Follow

User = get_user_model()
#我設定了 username 為 primary key，這樣就不需要額外的 id 欄位了，且使nickname, bio, avatar_url 為可選欄位，但email 為必填欄位
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ('username', 'password', 'nickname', 'email', 'bio', 'avatar_url')
        extra_kwargs = {'email': {'required': True}}
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password'],
            nickname=validated_data.get('nickname', ''),
            bio=validated_data.get('bio', ''),
            avatar_url=validated_data.get('avatar_url', ''),
        )
        return user

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class DollSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()
    tag_ids = serializers.ListField(write_only=True, child=serializers.IntegerField(), required=False)

    class Meta:
        model = Doll
        fields = ['id', 'username', 'name', 'birthday', 'description', 'avatar_url', 'created_at', 'tags', 'tag_ids']
        read_only_fields = ['created_at', 'username']

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        doll = Doll.objects.create(**validated_data)
        for tag_id in tag_ids:
            try:
                tag = Tag.objects.get(id=tag_id)
            except Tag.DoesNotExist:
                raise serializers.ValidationError({"tag_ids": [f"這個 tag id {tag_id} 不存在"]})
            DollTag.objects.create(doll_id=doll, tag_id=tag)
        return doll
    def validate_tag_ids(self, value):
        for tag_id in value:
            if not Tag.objects.filter(id=tag_id).exists():
                raise serializers.ValidationError(f"這個 tag id {tag_id} 不存在")
        return value
    def validate_id(self, value):
        if Doll.objects.filter(id=value).exists():
            raise serializers.ValidationError("A doll with this ID already exists.")
        return value
    def get_tags(self, obj):
        return TagSerializer(
            Tag.objects.filter(dolltag__doll_id=obj.id),
            many=True
        ).data
class DollIdOnlySerializer(serializers.ModelSerializer):
    class Meta:
        model = Doll
        fields = ['id']
class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ['from_doll_id', 'to_doll_id']