from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.conf import settings

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError("Username is required")
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, email, password, **extra_fields)
class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, primary_key=True)  # PK = username
    nickname = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    objects = CustomUserManager()
    
    def __str__(self):
        return self.username
class Doll(models.Model):
    id = models.CharField(primary_key=True, max_length=64)  # VARCHAR 作為 PK
    username = models.ForeignKey(User, to_field='username', on_delete=models.CASCADE, related_name='dolls')
    name = models.CharField(max_length=100)
    birthday = models.DateField()
    description = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
class Tag(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.category})"

class DollTag(models.Model):
    doll_id = models.ForeignKey(Doll, to_field='id', on_delete=models.CASCADE)
    tag_id = models.ForeignKey(Tag, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('doll_id', 'tag_id')

class Follow(models.Model):
    from_doll = models.ForeignKey(Doll, to_field='id', on_delete=models.CASCADE, related_name='following')
    to_doll = models.ForeignKey(Doll, to_field='id', on_delete=models.CASCADE, related_name='followers')

    class Meta:
        unique_together = ('from_doll', 'to_doll')
