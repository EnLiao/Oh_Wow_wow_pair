from django.db import models
from core.models import User, Doll, Tag

class Notification(models.Model):
    TYPE_CHOICES = [
        ('like', 'Like'),
        ('comment', 'Comment'),
        ('follow', 'Follow'),
    ]
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)

    doll = models.ForeignKey(Doll, on_delete=models.CASCADE, related_name='notifications')
    actor = models.ForeignKey(Doll, on_delete=models.CASCADE, related_name='notifications_sent', null=True, blank=True)

    target_id = models.CharField(max_length=100, blank=True)
    content = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.doll} - {self.type} - {self.created_at.strftime("%Y-%m-%d %H:%M:%S")}'
