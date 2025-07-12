from django.contrib import admin
from .models import Notification

# Register your models here.
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('doll', 'type', 'actor', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('doll__name', 'actor__name', 'content')
    ordering = ('-created_at',)