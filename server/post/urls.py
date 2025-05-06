from django.urls import path
from .views import PostCreateView, PostListView

urlpatterns = [
    path('posts/', PostCreateView.as_view(), name='post-create'),
    path('feed/', PostListView.as_view(), name='post-list'),
]