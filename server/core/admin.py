from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from unfold.admin import ModelAdmin, TabularInline
from unfold.contrib.filters.admin import (
    RangeDateFilter,
    RangeNumericFilter,
    SingleNumericFilter,
    SliderNumericFilter,
)
from unfold.decorators import display
from .models import User, Doll, Tag, Follow

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username', 'nickname', 'email', 'bio', 'avatar_image')

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ('username', 'nickname', 'email', 'bio', 'avatar_image')

@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):  # 繼承 ModelAdmin
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    
    # Unfold 樣式的列表顯示
    list_display = ('username', 'nickname_display', 'email', 'avatar_preview', 'bio_preview', 'created_at', 'is_staff_display')
    list_display_links = ('username',)
    search_fields = ('username', 'nickname', 'email', 'bio')
    list_filter = (
        'is_staff',
        ('created_at', RangeDateFilter),
    )
    ordering = ('-created_at',)
    
    # Unfold 樣式的詳細頁面布局
    fieldsets = (
        ("基本信息", {
            'fields': ('username', 'nickname', 'email'),
            'classes': ('collapse',),
        }),
        ("個人資料", {
            'fields': ('bio', 'avatar_image'),
        }),
        ("權限設置", {
            'fields': ('is_staff', 'is_active'),
            'classes': ('collapse',),
        }),
    )
    
    add_fieldsets = (
        ("創建新用戶", {
            'classes': ('wide',),
            'fields': ('username', 'nickname', 'email', 'password1', 'password2', 'is_staff')}
        ),
    )

    @display(description="昵稱", ordering="nickname")
    def nickname_display(self, obj):
        return obj.nickname or "未設置"

    @display(description="頭像")
    def avatar_preview(self, obj):
        if obj.avatar_image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;" />',
                obj.avatar_image.url
            )
        return "無頭像"

    @display(description="個人簡介")
    def bio_preview(self, obj):
        if obj.bio:
            return obj.bio[:30] + "..." if len(obj.bio) > 30 else obj.bio
        return "無簡介"

    @display(description="員工", boolean=True)
    def is_staff_display(self, obj):
        return obj.is_staff

    def save_model(self, request, obj, form, change):
        if not change:  # If creating a new user
            obj.set_password(form.cleaned_data['password1'])
        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(is_staff=False)

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if obj is not None and obj.username == request.user.username:
            return True
        return False

    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if obj is not None and obj.username == request.user.username:
            return True
        return False

    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if obj is not None and obj.username == request.user.username:
            return True
        return False

    def get_readonly_fields(self, request, obj=None):
        if request.user.is_superuser:
            return []
        if obj is not None and obj.username == request.user.username:
            return ['username', 'nickname', 'email', 'bio', 'avatar_image']
        return ['username', 'nickname', 'email', 'bio', 'avatar_image']

    def get_fieldsets(self, request, obj=None):
        if request.user.is_superuser:
            return super().get_fieldsets(request, obj)
        if obj is not None and obj.username == request.user.username:
            return (
                ("基本信息", {
                    'fields': ('username', 'nickname', 'email', 'bio')
                }),
            )
        return (
            ("基本信息", {
                'fields': ('username', 'nickname', 'email', 'bio')
            }),
        )

class DollTagInline(TabularInline):
    model = Doll.tag.through
    extra = 1
    verbose_name = "標籤"
    verbose_name_plural = "標籤"

@admin.register(Doll)
class DollAdmin(ModelAdmin):  # 改為繼承 ModelAdmin
    list_display = ('id', 'name', 'avatar_preview', 'username_link', 'birthday', 'tag_list', 'created_at')
    list_display_links = ('id', 'name')
    list_filter = (
        'username',
        ('birthday', RangeDateFilter),
        ('created_at', RangeDateFilter),
        'tag',
    )
    search_fields = ('id', 'name', 'description', 'username__username')
    filter_horizontal = ('tag',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ("基本信息", {
            'fields': ('id', 'name', 'username'),
        }),
        ("詳細信息", {
            'fields': ('birthday', 'description', 'avatar_image'),
        }),
        ("標籤", {
            'fields': ('tag',),
        }),
    )

    @display(description="頭像")
    def avatar_preview(self, obj):
        if obj.avatar_image:
            return format_html(
                '<img src="{}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />',
                obj.avatar_image.url
            )
        return "無頭像"

    @display(description="主人", ordering="username")
    def username_link(self, obj):
        url = reverse('admin:core_user_change', args=[obj.username.pk])
        return format_html('<a href="{}">{}</a>', url, obj.username.username)

    @display(description="標籤")
    def tag_list(self, obj):
        tags = obj.tag.all()
        if tags:
            tag_links = []
            for tag in tags:
                url = reverse('admin:core_tag_change', args=[tag.pk])
                tag_links.append(f'<a href="{url}">{tag.name}</a>')
            return mark_safe(', '.join(tag_links))
        return "無標籤"

@admin.register(Tag)
class TagAdmin(ModelAdmin):  # 改為繼承 ModelAdmin
    list_display = ('id', 'name', 'doll_count')
    search_fields = ('name',)
    
    @display(description="使用此標籤的娃娃數量")
    def doll_count(self, obj):
        count = obj.dolls.count()
        if count > 0:
            url = reverse('admin:core_doll_changelist') + f'?tag__exact={obj.id}'
            return format_html('<a href="{}">{} 個娃娃</a>', url, count)
        return "0 個娃娃"

@admin.register(Follow)
class FollowAdmin(ModelAdmin):  # 改為繼承 ModelAdmin
    list_display = ('from_doll_link', 'to_doll_link', 'created_at')
    list_filter = (
        ('created_at', RangeDateFilter),
        'from_doll_id__username',
    )
    search_fields = ('from_doll_id__id', 'to_doll_id__id', 'from_doll_id__name', 'to_doll_id__name')
    raw_id_fields = ('from_doll_id', 'to_doll_id')

    @display(description="關注者", ordering="from_doll_id")
    def from_doll_link(self, obj):
        url = reverse('admin:core_doll_change', args=[obj.from_doll_id.pk])
        return format_html('<a href="{}">{}</a>', url, obj.from_doll_id.name or obj.from_doll_id.id)

    @display(description="被關注者", ordering="to_doll_id")
    def to_doll_link(self, obj):
        url = reverse('admin:core_doll_change', args=[obj.to_doll_id.pk])
        return format_html('<a href="{}">{}</a>', url, obj.to_doll_id.name or obj.to_doll_id.id)

# 移除手動註冊，因為已經使用 @admin.register 裝飾器