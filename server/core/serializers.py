from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Doll, Tag, Follow
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.core.cache import cache
import requests

User = get_user_model()
#我設定了 username 為 primary key，這樣就不需要額外的 id 欄位了，且使nickname, bio, avatar_image 為可選欄位，但email 為必填欄位
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    recaptcha_token = serializers.CharField(write_only=True, required=True)
    class Meta:
        model = User
        fields = ('username', 'password', 'nickname', 'email', 'bio', 'avatar_image', 'recaptcha_token')
        extra_kwargs = {'email': {'required': True}}
    def validate_username(self, value):
        if len(value) > 150:
            raise serializers.ValidationError("使用者名稱長度不能超過 150 字元")
        return value

    def validate_nickname(self, value):
        if len(value) > 100:
            raise serializers.ValidationError("暱稱長度不能超過 100 字元")
        return value
    def validate_avatar_image(self, value):
        limit = 3 * 1024 * 1024  # 3MB
        if value.size > limit:
            raise serializers.ValidationError("圖片太大，不能超過 3MB")
        return value
    def validate(self, data):
        # Google reCAPTCHA 驗證
        recaptcha_token = data.get('recaptcha_token')
        if not recaptcha_token:
            raise serializers.ValidationError({'recaptcha_token': '請通過人機驗證'})
        resp = requests.post(
            'https://www.google.com/recaptcha/api/siteverify',
            data={
                'secret': settings.RECAPTCHA_SECRET_KEY,
                'response': recaptcha_token
            }
        )
        result = resp.json()
        if not result.get('success'):
            raise serializers.ValidationError({'recaptcha_token': 'reCAPTCHA 驗證失敗，請重試'})
        return data
    def create(self, validated_data):
        validated_data.pop('recaptcha_token', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password'],
            nickname=validated_data.get('nickname', ''),
            bio=validated_data.get('bio', ''),
            avatar_image=validated_data.get('avatar_image', ''),
        )
        return user

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']
    def validate_name(self, value):
        if len(value) > 100:
            raise serializers.ValidationError("標籤名稱長度不能超過 100 字元")
        return value

class DollSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()
    tag_ids = serializers.ListField(write_only=True, child=serializers.IntegerField(), required=False)

    class Meta:
        model = Doll
        fields = ['id', 'username', 'name', 'birthday', 'description', 'avatar_image', 'created_at', 'tags', 'tag_ids']
        read_only_fields = ['created_at', 'username']

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        doll = Doll.objects.create(**validated_data)
        for tag_id in tag_ids:
            try:
                tag = Tag.objects.get(id=tag_id)
            except Tag.DoesNotExist:
                raise serializers.ValidationError({"tag_ids": [f"這個 tag id {tag_id} 不存在"]})
            doll.tag.add(tag)
        return doll
    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request and hasattr(instance, 'username') and instance.username != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("只能編輯自己創建的娃娃")
        # 更新標籤
        tag_ids = validated_data.pop('tag_ids', None)
        if tag_ids is not None:
            instance.tag.set(Tag.objects.filter(id__in=tag_ids))
        # 其他欄位
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    def validate_avatar_image(self, value):
        limit = 3 * 1024 * 1024  # 3MB
        if value.size > limit:
            raise serializers.ValidationError("圖片太大，不能超過 3MB")
        return value
    def validate_tag_ids(self, value):
        for tag_id in value:
            if not Tag.objects.filter(id=tag_id).exists():
                raise serializers.ValidationError(f"這個 tag id {tag_id} 不存在")
        return value
    def validate(self, value):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            doll_count = Doll.objects.filter(username=request.user.username).count()
            if doll_count >= 10:
                raise serializers.ValidationError("每位使用者最多只能創建 10 個娃娃")
        return value
    def validate_id(self, value):
        if len(value) > 64:
            raise serializers.ValidationError("娃娃 ID 長度不能超過 64 字元")
        if Doll.objects.filter(id=value).exists():
            raise serializers.ValidationError("娃娃 id 已存在")
        return value
    def validate_name(self, value):
        if len(value) > 100:
            raise serializers.ValidationError("娃娃名稱長度不能超過 100 字元")
        return value
    def get_tags(self, obj):
        return TagSerializer(
            obj.tag.all(),
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