from django.db import models, transaction
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import uuid
from core.models import User, Doll, Tag, DollTag
from django.db.models import Max

class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doll_id = models.ForeignKey(Doll, to_field='id', on_delete=models.CASCADE)
    content = models.TextField()
    image_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

class Comment(models.Model):
    post_id = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments', db_column='post_id')
    doll_id = models.ForeignKey(Doll, on_delete=models.CASCADE, db_column='doll_id')
    
    local_id = models.IntegerField()
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post_id', 'local_id') 
        ordering = ['local_id']

    def save(self, *args, **kwargs):
        if self.local_id is None and self.post_id:
            with transaction.atomic():
                last_comment = Comment.objects.select_for_update().filter(post_id=self.post_id).order_by('-local_id').first()
                max_local_id = last_comment.local_id if last_comment else 0
                self.local_id = max_local_id + 1

        super().save(*args, **kwargs)

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