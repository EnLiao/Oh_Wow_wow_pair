from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
class User(AbstractUser):
    nickname = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
class Doll(models.Model):
    doll_id = models.AutoField(primary_key=True)  #PK：自動遞增
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
    tags = models.ManyToManyField('Tag', through='DollTag', related_name='dolls')
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
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    class Meta:
        unique_together = ('doll', 'tag') #複合主鍵