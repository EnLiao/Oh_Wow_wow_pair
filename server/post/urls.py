from django.urls import path
from .views import PostCreateView

urlpatterns = [
    path('posts/', PostCreateView.as_view(), name='post-create'),
]
