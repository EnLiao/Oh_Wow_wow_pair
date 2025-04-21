from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .serializers import DollSerializer, TagSerializer
from .serializers import RegisterSerializer
from .models import Doll, Tag

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
class DollListCreateView(generics.ListCreateAPIView):
    queryset = Doll.objects.all()
    serializer_class = DollSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TagListCreateView(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer