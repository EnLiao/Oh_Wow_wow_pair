from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from rest_framework.generics import RetrieveAPIView
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
        serializer.save(username=self.request.user)

class TagListCreateView(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]
class DollDetailView(RetrieveAPIView):
    queryset = Doll.objects.all()
    serializer_class = DollSerializer
    permission_classes = [AllowAny]  #如果娃娃主頁公開，設 AllowAny；若需登入可改 IsAuthenticated
    lookup_field = 'id'  #明確指定使用 doll 的 id 欄位（VARCHAR PK）