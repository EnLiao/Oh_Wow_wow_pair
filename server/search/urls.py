# search/urls.py
from django.urls import path
from . import views
from .views import DollIdSearchAPIView

urlpatterns = [
    path('doll-ids/', DollIdSearchAPIView.as_view(), name='search-doll-ids'),
]
