from django.urls import path
from .views import RegisterView, CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from .views import DollListCreateView, TagListView, DollDetailView, FollowersListView, FollowersToListView, UserDollListView, FollowView, DollUpdateView, check_following
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path


urlpatterns = [
    #path('admin/', admin.site.urls),
    #path('core/', include('core.urls')),
    #path('post/', include('post.urls')),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('dolls/', DollListCreateView.as_view(), name='doll-list-create'),
    path('dolls/<str:id>/', DollDetailView.as_view(), name='doll-detail'),
    path('dolls/<str:id>/followers/', FollowersListView.as_view(), name='doll-followers'),
    path('dolls/<str:id>/follower_to/', FollowersToListView.as_view(), name='doll-follower_to'),
    path('follow/', FollowView.as_view(), name='follow'),
    path('users/<str:username>/dolls/', UserDollListView.as_view(), name='user-dolls'),
    path('tags/', TagListView.as_view(), name='tag-list'),
    path('dolls/<str:id>/edit/', DollUpdateView.as_view(), name='doll-update'),
    path('check_following/', check_following, name='check-following'),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)