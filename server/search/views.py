from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from core.models import Doll
from post.models import Post

class DollIdSearchAPIView(APIView):
    def get(self, request):
        keyword = request.GET.get('q', '').strip()
        if not keyword:
            return Response({'results': []})

        dolls = Doll.objects.filter(id__icontains=keyword).order_by('id')[:10]
        ids = [d.id for d in dolls]
        return Response({'results': ids})
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
