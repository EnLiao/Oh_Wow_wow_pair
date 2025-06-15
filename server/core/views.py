from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.cache import cache
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from .serializers import DollSerializer, TagSerializer
from .serializers import RegisterSerializer, DollIdOnlySerializer, FollowSerializer
from .models import Doll, Tag, Follow
from rest_framework.throttling import UserRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from .token_serializers import CustomTokenObtainPairWithRecaptchaSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveAPIView, ListAPIView, RetrieveUpdateAPIView

User = get_user_model()

class LoginRateThrottle(UserRateThrottle):
    rate = '5/min'

class CustomTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]
    serializer_class = CustomTokenObtainPairWithRecaptchaSerializer

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
class FollowView(APIView):
    def post(self, request):
        serializer = FollowSerializer(data=request.data)
        if serializer.is_valid():
            from_doll_id = serializer.validated_data['from_doll_id']
            to_doll_id = serializer.validated_data['to_doll_id']

            # 僅允許操作自己帳號下的娃娃
            try:
                doll = Doll.objects.get(id=from_doll_id.id if hasattr(from_doll_id, 'id') else from_doll_id)
            except Doll.DoesNotExist:
                return Response({'detail': '娃娃不存在'}, status=status.HTTP_400_BAD_REQUEST)
            if doll.username != request.user:
                return Response({'detail': '你只能操作自己擁有的娃娃'}, status=status.HTTP_403_FORBIDDEN)

            if from_doll_id == to_doll_id:
                return Response({'detail': '不能追蹤自己'}, status=status.HTTP_400_BAD_REQUEST)

            if Follow.objects.filter(from_doll_id=from_doll_id, to_doll_id=to_doll_id).exists():
                return Response({'detail': '已經追蹤過了'}, status=status.HTTP_400_BAD_REQUEST)

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        from_doll_id = request.data.get('from_doll_id')
        to_doll_id = request.data.get('to_doll_id')

        if not from_doll_id or not to_doll_id:
            return Response({'detail': '缺少 from_doll_id 或 to_doll_id'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            doll = Doll.objects.get(id=from_doll_id)
        except Doll.DoesNotExist:
            return Response({'detail': '娃娃不存在'}, status=status.HTTP_400_BAD_REQUEST)
        if doll.username != request.user:
            return Response({'detail': '你只能操作自己擁有的娃娃'}, status=status.HTTP_403_FORBIDDEN)

        try:
            follow = Follow.objects.get(from_doll_id=from_doll_id, to_doll_id=to_doll_id)
            follow.delete()
            return Response({'detail': '已取消追蹤'}, status=status.HTTP_204_NO_CONTENT)
        except Follow.DoesNotExist:
            return Response({'detail': '尚未追蹤，無法取消'}, status=status.HTTP_400_BAD_REQUEST)
class DollUpdateView(RetrieveUpdateAPIView):
    queryset = Doll.objects.all()
    serializer_class = DollSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def perform_update(self, serializer):
        doll = self.get_object()
        if doll.username != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("只能編輯自己的娃娃")
        # 禁止更改 username
        serializer.save(username=doll.username)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_following(request):
    from_doll_id = request.query_params.get('from_doll_id')
    to_doll_id = request.query_params.get('to_doll_id')
    if not from_doll_id or not to_doll_id:
        return Response({'detail': '缺少 from_doll_id 或 to_doll_id', 'is_following': False}, status=status.HTTP_400_BAD_REQUEST)
    try:
        doll = Doll.objects.get(id=from_doll_id)
    except Doll.DoesNotExist:
        return Response({'detail': '娃娃不存在', 'is_following': False}, status=status.HTTP_400_BAD_REQUEST)
    if doll.username != request.user:
        return Response({'detail': '你只能查詢自己擁有的娃娃'}, status=status.HTTP_403_FORBIDDEN)
    is_following = Follow.objects.filter(from_doll_id=from_doll_id, to_doll_id=to_doll_id).exists()
    return Response({'is_following': is_following})