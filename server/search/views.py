from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from core.models import Doll

class DollIdSearchAPIView(APIView):
    def get(self, request):
        keyword = request.GET.get('q', '').strip()
        if not keyword:
            return Response({'results': []})

        dolls = Doll.objects.filter(id__icontains=keyword).order_by('id')[:10]
        ids = [d.id for d in dolls]
        return Response({'results': ids})
