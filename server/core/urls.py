from django.urls import path
from .views import RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import DollListCreateView, TagListView, DollDetailView, FollowersListView, FollowersToListView, UserDollListView, FollowView
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('dolls/', DollListCreateView.as_view(), name='doll-list-create'),
    path('dolls/<str:id>/', DollDetailView.as_view(), name='doll-detail'),
    path('dolls/<str:id>/followers/', FollowersListView.as_view(), name='doll-followers'),
    path('dolls/<str:id>/follower_to/', FollowersToListView.as_view(), name='doll-follower_to'),
    path('follow/', FollowView.as_view(), name='follow'),
    path('users/<str:username>/dolls/', UserDollListView.as_view(), name='user-dolls'),
    path('tags/', TagListView.as_view(), name='tag-list'),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)