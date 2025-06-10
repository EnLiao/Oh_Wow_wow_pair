from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from unfold.admin import ModelAdmin, TabularInline
from unfold.contrib.filters.admin import RangeDateFilter
from unfold.decorators import display
from .models import Post, Comment, Likes, Favorite, PostSeen

@admin.register(Post)
class PostAdmin(ModelAdmin):
    list_display = ('id_short', 'doll_link', 'content_preview', 'image_preview', 'like_count', 'comment_count', 'created_at')
    list_filter = (
        ('created_at', RangeDateFilter),
        'doll_id__username',
    )
    search_fields = ('content', 'doll_id__id', 'doll_id__name')
    raw_id_fields = ('doll_id',)
    readonly_fields = ('id', 'created_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ("貼文資訊", {
            'fields': ('id', 'doll_id', 'content'),
        }),
        ("媒體", {
            'fields': ('image',),
        }),
        ("時間資訊", {
            'fields': ('created_at',),
        }),
    )

    @display(description="ID", ordering="id")
    def id_short(self, obj):
        return str(obj.id)[:8] + "..."

    @display(description="發布者")
    def doll_link(self, obj):
        url = reverse('admin:core_doll_change', args=[obj.doll_id.pk])
        return format_html('<a href="{}">{}</a>', url, obj.doll_id.name or obj.doll_id.id)

    @display(description="內容預覽")
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content

    @display(description="圖片")
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;" />',
                obj.image.url
            )
        return "無圖片"

    @display(description="點讚數")
    def like_count(self, obj):
        count = obj.likes_set.count()
        return f"{count} 讚"

    @display(description="評論數")
    def comment_count(self, obj):
        count = obj.comments.count()
        return f"{count} 條評論"

@admin.register(Comment)
class CommentAdmin(ModelAdmin):
    list_display = ('local_id', 'post_link', 'doll_link', 'content_preview', 'created_at')
    list_filter = (
        ('created_at', RangeDateFilter),
        'doll_id__username',
    )
    search_fields = ('content', 'doll_id__id', 'post_id__content')
    raw_id_fields = ('post_id', 'doll_id')
    readonly_fields = ('local_id', 'created_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        ("評論資訊", {
            'fields': ('local_id', 'post_id', 'doll_id', 'content'),
        }),
        ("時間資訊", {
            'fields': ('created_at',),
        }),
    )

    @display(description="貼文")
    def post_link(self, obj):
        url = reverse('admin:post_post_change', args=[obj.post_id.pk])
        return format_html('<a href="{}">貼文 {}</a>', url, str(obj.post_id.id)[:8])

    @display(description="評論者")
    def doll_link(self, obj):
        url = reverse('admin:core_doll_change', args=[obj.doll_id.pk])
        return format_html('<a href="{}">{}</a>', url, obj.doll_id.name or obj.doll_id.id)

    @display(description="評論內容")
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content

@admin.register(Likes)
class LikesAdmin(ModelAdmin):
    list_display = ('doll_link', 'post_link', 'created_at')
    list_filter = (
        ('created_at', RangeDateFilter),
        'doll_id__username',
    )
    raw_id_fields = ('doll_id', 'post_id')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'

    fieldsets = (
        ("點讚資訊", {
            'fields': ('doll_id', 'post_id'),
        }),
        ("時間資訊", {
            'fields': ('created_at',),
        }),
    )

    @display(description="點讚者")
    def doll_link(self, obj):
        url = reverse('admin:core_doll_change', args=[obj.doll_id.pk])
        return format_html('<a href="{}">{}</a>', url, obj.doll_id.name or obj.doll_id.id)

    @display(description="貼文")
    def post_link(self, obj):
        url = reverse('admin:post_post_change', args=[obj.post_id.pk])
        return format_html('<a href="{}">貼文 {}</a>', url, str(obj.post_id.id)[:8])

@admin.register(Favorite)
class FavoriteAdmin(ModelAdmin):
    list_display = ('doll_link', 'post_link', 'created_at')
    list_filter = (
        ('created_at', RangeDateFilter),
        'doll_id__username',
    )
    raw_id_fields = ('doll_id', 'post_id')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'

    fieldsets = (
        ("收藏資訊", {
            'fields': ('doll_id', 'post_id'),
        }),
        ("時間資訊", {
            'fields': ('created_at',),
        }),
    )

    @display(description="收藏者")
    def doll_link(self, obj):
        url = reverse('admin:core_doll_change', args=[obj.doll_id.pk])
        return format_html('<a href="{}">{}</a>', url, obj.doll_id.name or obj.doll_id.id)

    @display(description="貼文")
    def post_link(self, obj):
        url = reverse('admin:post_post_change', args=[obj.post_id.pk])
        return format_html('<a href="{}">貼文 {}</a>', url, str(obj.post_id.id)[:8])

@admin.register(PostSeen)
class PostSeenAdmin(ModelAdmin):
    list_display = ('doll_link', 'post_link', 'seen_at')
    list_filter = (
        ('seen_at', RangeDateFilter),
        'doll_id__username',
    )
    raw_id_fields = ('doll_id', 'post_id')
    readonly_fields = ('seen_at',)
    date_hierarchy = 'seen_at'

    fieldsets = (
        ("瀏覽記錄", {
            'fields': ('doll_id', 'post_id'),
        }),
        ("時間資訊", {
            'fields': ('seen_at',),
        }),
    )

    @display(description="瀏覽者")
    def doll_link(self, obj):
        url = reverse('admin:core_doll_change', args=[obj.doll_id.pk])
        return format_html('<a href="{}">{}</a>', url, obj.doll_id.name or obj.doll_id.id)

    @display(description="貼文")
    def post_link(self, obj):
        url = reverse('admin:post_post_change', args=[obj.post_id.pk])
        return format_html('<a href="{}">貼文 {}</a>', url, str(obj.post_id.id)[:8])