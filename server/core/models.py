from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
'''
super user:
admin
admin@ntnu.com
abcde
abcde
'''
'''
我設定了 username 為 primary key
這樣就不需要額外的 id 欄位了
且使nickname, bio, avatar_url 為可選欄位
但email, username, password為必填欄位
'''
class User(AbstractUser):
    username = models.CharField(max_length=150, primary_key=True)
    nickname = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
'''
我設定了 id 為 primary key
且使 description, avatar_url, created_at 為可選欄位
username 為 ForeignKey，指向 User 的 username 欄位 -> 表示主人的名字
但 id, name, birthday 為必填欄位
'''
class Doll(models.Model):
    id = models.CharField(primary_key=True, max_length=64)
    username = models.ForeignKey(User, to_field='username', on_delete=models.CASCADE, related_name='dolls')
    name = models.CharField(max_length=100)
    birthday = models.DateField()
    description = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    tag = models.ManyToManyField('Tag',  related_name='dolls')

    def __str__(self):
        return self.name
class Tag(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class Follow(models.Model):
    from_doll = models.ForeignKey(Doll, to_field='id', on_delete=models.CASCADE, related_name='following')
    to_doll = models.ForeignKey(Doll, to_field='id', on_delete=models.CASCADE, related_name='followers')

    class Meta:
        unique_together = ('from_doll', 'to_doll')
