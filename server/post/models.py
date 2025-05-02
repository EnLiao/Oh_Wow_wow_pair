from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import uuid
from core.models import User, Doll, Tag, DollTag

class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doll = models.ForeignKey(Doll, on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Comment(models.Model):
    id = models.AutoField(primary_key=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    #user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Likes(models.Model):
    #user = models.ForeignKey(User, on_delete=models.CASCADE)
    doll = models.ForeignKey(Doll, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    like_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('doll', 'post')

class Favorite(models.Model):
    #user = models.ForeignKey(User, on_delete=models.CASCADE)
    doll = models.ForeignKey(Doll, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    favorite_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('doll', 'post')
