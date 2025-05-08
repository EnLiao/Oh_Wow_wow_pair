from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from rest_framework.generics import RetrieveAPIView, ListAPIView
from .serializers import DollSerializer, TagSerializer
from .serializers import RegisterSerializer, DollIdOnlySerializer
from .models import Doll, Tag, Follow

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

class TagListView(generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]
class DollDetailView(RetrieveAPIView):
    queryset = Doll.objects.all()
    serializer_class = DollSerializer
    permission_classes = [AllowAny]  #如果娃娃主頁公開，設 AllowAny；若需登入可改 IsAuthenticated
    lookup_field = 'id'  #明確指定使用 doll 的 id 欄位（VARCHAR PK）
class FollowersListView(ListAPIView):
    serializer_class = DollSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        doll_id = self.kwargs['id']
        return Doll.objects.filter(
            id__in=Follow.objects.filter(to_doll_id=doll_id).values_list('from_doll_id', flat=True)
        )
class FollowersToListView(ListAPIView):
    serializer_class = DollSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        doll_id = self.kwargs['id']
        return Doll.objects.filter(
            id__in=Follow.objects.filter(from_doll_id=doll_id).values_list('to_doll_id', flat=True)
        )
class UserDollListView(generics.ListAPIView):
    serializer_class = DollIdOnlySerializer

    def get_queryset(self):
        username = self.kwargs['username']
        return Doll.objects.filter(username=username)