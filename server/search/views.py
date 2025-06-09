from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from core.models import Doll
from post.models import Post
from django.db import models

class DollIdSearchAPIView(APIView):
    def get(self, request):
        keyword = request.GET.get('q', '').strip()
        if not keyword:
            return Response({'results': []})

        dolls = Doll.objects.filter(
            models.Q(id__icontains=keyword) | models.Q(name__icontains=keyword)
        ).order_by('id')[:10]
        
        result = []
        for d in dolls:
            avatar_url = None
            if d.avatar_image:
                if request:
                    avatar_url = request.build_absolute_uri(d.avatar_image.url)
                else:
                    avatar_url = d.avatar_image.url
            result.append({
                "id": d.id,
                "name": d.name,
                "avatar": avatar_url,
            })
        return Response({'results': result})
    
class PostSearchAPIView(APIView):
    def get(self, request):
        keyword = request.GET.get('q', '').strip()
        if not keyword:
            return Response({'results': []})

        posts = Post.objects.filter(content__icontains=keyword).order_by('-created_at')[:10]
        results = []
        for post in posts:
            result = {
                'id': post.id,
                'content': post.content,
                'image': post.image.url if post.image else None,  # 添加圖片 URL
                'doll_id': post.doll_id.id,  # 可選：添加發文娃娃 ID
                'created_at': post.created_at,  # 可選：添加創建時間
            }
            results.append(result)
        return Response({'results': results})
