from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.conf import settings
import requests
from rest_framework import serializers

class CustomTokenObtainPairWithRecaptchaSerializer(TokenObtainPairSerializer):
    recaptcha_token = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        recaptcha_token = attrs.get('recaptcha_token')
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
        # Remove recaptcha_token before passing to super
        attrs.pop('recaptcha_token', None)
        return super().validate(attrs)
