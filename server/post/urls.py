from django.urls import path
from .views import PostCreateView, PostListView, LikePostView

urlpatterns = [
    path('posts/', PostCreateView.as_view(), name='post-create'),
    path('feed/', PostListView.as_view(), name='post-list'),
    path('posts/<uuid:post_id>/like/', LikePostView.as_view(), name='post-like'),
]