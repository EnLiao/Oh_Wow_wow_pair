from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
import uuid
class User(AbstractUser):
    nickname = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
class Doll(models.Model):
    doll_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='dolls'
    )#FK：對應使用者
    name = models.CharField(max_length=100)
    birthday = models.DateField()
    description = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    tags = models.ManyToManyField('Tag', through='DollTag', through_fields=('doll', 'tag'))
    def __str__(self):
        return self.name
class Tag(models.Model):
    tag_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    def __str__(self):
        return f"{self.name} ({self.category})"

class DollTag(models.Model):
    doll = models.ForeignKey(Doll, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, blank = True)
    class Meta:
        unique_together = ('doll', 'tag') #複合主鍵

