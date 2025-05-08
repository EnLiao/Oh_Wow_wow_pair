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
        
        seen_post_ids = PostSeen.objects.filter(doll_id=doll_id).values_list('post_id', flat=True)
        return Post.objects.exclude(id__in=seen_post_ids).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        doll_id = self.request.query_params.get('doll_id')
        if not doll_id:
            return response
        
        doll = get_object_or_404(Doll, id=doll_id)
        post_ids = [post['id'] for post in response.data]  # 這些就是尚未看過的貼文
        
        posts = Post.objects.filter(id__in=post_ids)
        post_map = {str(post.id): post for post in posts}

        seen_objects = [
            PostSeen(doll_id=doll, post_id=post_map[str(post_id)])
            for post_id in post_ids
        ]
        PostSeen.objects.bulk_create(seen_objects, ignore_conflicts=True)

        return response
    
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