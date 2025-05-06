from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Post, PostSeen
from .serializers import PostSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from rest_framework.exceptions import NotFound, PermissionDenied
from core.models import Doll, Follow

class PostCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # 需要登入
    def post(self, request):
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save() 
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PostListView(ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        doll_id = self.request.query_params.get('doll_id')
        if not doll_id:
            return Post.objects.none()
        #followed_doll_ids = Follow.objects.filter(from_doll_id=doll_id).values_list('to_doll_id', flat=True)
        seen_post_ids = PostSeen.objects.filter(doll_id=doll_id).values_list('post_id', flat=True)

        #return Post.objects.filter(doll_id__in=followed_doll_ids).exclude(id__in=seen_post_ids).order_by('-created_at')
        return Post.objects.exclude(id__in=seen_post_ids).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        
        doll_id = self.request.query_params.get('doll_id')
        post_ids = [post['id'] for post in response.data]

        seen_objects = [
            PostSeen(doll_id=doll_id, post_id=post_id)
            for post_id in post_ids
        ]
        PostSeen.objects.bulk_create(seen_objects, ignore_conflicts=True)  # 避免重複加入

        return response