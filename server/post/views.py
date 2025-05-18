from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from .models import Post, PostSeen, Comment, Likes, Favorite
from .serializers import PostSerializer, CommentSerializer, LikesSerializer, FavoriteSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from rest_framework.exceptions import NotFound, PermissionDenied
from core.models import Doll, Follow
from django.shortcuts import get_object_or_404
from itertools import chain
from django.db import transaction
from rest_framework.pagination import LimitOffsetPagination

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

    def list(self, request, *args, **kwargs):
        doll_id = request.query_params.get('doll_id')
        if not doll_id:
            return super().list(request, *args, **kwargs)

        doll = get_object_or_404(Doll, id=doll_id)
        seen_ids = PostSeen.objects.filter(doll_id=doll).values_list('post_id', flat=True)
        followed_ids = Follow.objects.filter(from_doll_id=doll).values_list('to_doll_id', flat=True)

        qs_followed = Post.objects.filter(
            doll_id__in=followed_ids
        ).exclude(id__in=seen_ids).order_by('-created_at')[:5]

        remaining = 5 - qs_followed.count()
        qs_others = Post.objects.exclude(
            doll_id__in=followed_ids
        ).exclude(id__in=seen_ids).order_by('-created_at')[:remaining]

        posts = sorted(
            chain(qs_followed, qs_others),
            key=lambda p: p.created_at,
            reverse=True
        )

        serializer = self.get_serializer(posts, many=True, context={'doll_id': doll})
        data = serializer.data

        seen_objs = [PostSeen(doll_id=doll, post_id=post) for post in posts]
        with transaction.atomic():
            PostSeen.objects.bulk_create(seen_objs, ignore_conflicts=True)

        return Response(data, status=status.HTTP_200_OK)

    def get_queryset(self):
        return Post.objects.none()
    
class LikePostView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        doll_id = request.data.get('doll_id')
        doll = get_object_or_404(Doll, id=doll_id)
        post = get_object_or_404(Post, id=post_id)
        like, created = Likes.objects.get_or_create(doll_id=doll, post_id=post.id)
        serializer = PostSerializer(post, context={'request': request, 'doll_id': doll_id})
        if created:
            return Response({'message': 'Liked', 'post': serializer.data}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Already liked', 'post': serializer.data}, status=status.HTTP_200_OK)

    def delete(self, request, post_id):
        doll_id = request.data.get('doll_id')
        doll = get_object_or_404(Doll, id=doll_id)
        post = get_object_or_404(Post, id=post_id)
        deleted, _ = Likes.objects.filter(doll_id=doll, post_id=post.id).delete()
        serializer = PostSerializer(post, context={'request': request, 'doll_id': doll_id})
        if deleted:
            return Response({'message': 'Unliked', 'post': serializer.data}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Not previously liked', 'post': serializer.data}, status=status.HTTP_400_BAD_REQUEST)
        
class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(post_id=post_id).order_by('created_at')

    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        post = get_object_or_404(Post, id=post_id)
        doll_id = self.request.data.get('doll_id')
        doll = get_object_or_404(Doll, id=doll_id)
        serializer.save(post_id=post, doll_id=doll)

class CustomLimitOffsetPagination(LimitOffsetPagination):
    default_limit = 5
    max_limit = 100

class DollProfilePostListView(ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CustomLimitOffsetPagination

    def get_queryset(self):
        doll_id = self.request.query_params.get("doll_id")
        if not doll_id:
            return Post.objects.none()
        
        return Post.objects.filter(doll_id=doll_id).order_by("-created_at")
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["doll_id"] = self.request.query_params.get("viewer_doll_id")
        return context