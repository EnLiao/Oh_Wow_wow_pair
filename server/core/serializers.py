from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Doll, Tag, DollTag

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'nickname', 'email', 'bio', 'avatar_url')

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
        fields = ['tag_id', 'name', 'category']

class DollSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.ListField(write_only=True, child=serializers.IntegerField(), required=False)

    class Meta:
        model = Doll
        fields = ['doll_id', 'user', 'name', 'birthday', 'description', 'avatar_url', 'created_at', 'tags', 'tag_ids']
        read_only_fields = ['doll_id', 'created_at', 'user']

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        doll = Doll.objects.create(**validated_data)
        for tag_id in tag_ids:
            DollTag.objects.create(doll=doll, tag_id=tag_id)
        return doll
