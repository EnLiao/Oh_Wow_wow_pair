from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import uuid
from core.models import User, Doll, Tag, DollTag

class Posts(models.Model):
    post_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doll = models.ForeignKey(Doll, on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    visibility = models.CharField(max_length=10, choices=[('public', 'Public'), ('private', 'Private')], default='public')
    created_at = models.DateTimeField(auto_now_add=True)

"""
class Comment(models.Model):
    comment_id = models.AutoField(primary_key=True)
    post_id = 
"""
