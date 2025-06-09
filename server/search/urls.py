# search/urls.py
from django.urls import path
from . import views
from .views import DollIdSearchAPIView, PostSearchAPIView

urlpatterns = [
    path('doll-ids/', DollIdSearchAPIView.as_view(), name='search-doll-ids'),
    path('posts/', PostSearchAPIView.as_view(), name='search-posts'),
]
