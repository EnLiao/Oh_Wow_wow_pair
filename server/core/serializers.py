from rest_framework import serializers
from django.contrib.auth import get_user_model

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
