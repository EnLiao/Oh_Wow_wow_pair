from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import uuid
from core.models import User, Doll, Tag

class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doll_id = models.ForeignKey(Doll, to_field='id', on_delete=models.CASCADE)
    content = models.TextField()
    image_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

class Comment(models.Model):
    id = models.AutoField(primary_key=True)
    post_id = models.ForeignKey(Post, to_field='id', on_delete=models.CASCADE)
    doll_id = models.ForeignKey(Doll, to_field='id', on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('post_id', 'id')

class Likes(models.Model):
    doll_id = models.ForeignKey(Doll, to_field='id', on_delete=models.CASCADE)
    post_id = models.ForeignKey(Post, to_field='id', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('doll_id', 'post_id')

class Favorite(models.Model):
    doll_id = models.ForeignKey(Doll, to_field='id', on_delete=models.CASCADE)
    post_id = models.ForeignKey(Post, to_field='id', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('doll_id', 'post_id')

class PostSeen(models.Model):
    doll_id = models.ForeignKey(Doll, to_field='id', on_delete=models.CASCADE)
    post_id = models.ForeignKey(Post, to_field='id', on_delete=models.CASCADE)
    seen_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('doll_id', 'post_id')