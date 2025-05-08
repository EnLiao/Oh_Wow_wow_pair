from django.contrib import admin
from .models import User, Doll, DollTag, Tag, Follow


class DollAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'birthday')

class TagAdmin(admin.ModelAdmin):
    pass

class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'nickname', 'email', 'bio', 'avatar_url', 'created_at')
    search_fields = ('username', 'nickname', 'email')
    ordering = ('-created_at',)
    list_filter = ('is_staff',)
    fieldsets = (
        (None, {
            'fields': ('username', 'nickname', 'email', 'bio', 'avatar_url')
        }),
        ('Permissions', {
            'fields': ('is_staff',)
        }),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'nickname', 'email', 'password1', 'password2', 'is_staff')}
        ),
    )
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
            return ['username', 'nickname', 'email', 'bio', 'avatar_url']
        return ['username', 'nickname', 'email', 'bio', 'avatar_url']
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if request.user.is_superuser:
            form.base_fields['is_staff'].widget.attrs['disabled'] = True
        return form
    def get_fieldsets(self, request, obj=None):
        if request.user.is_superuser:
            return super().get_fieldsets(request, obj)
        if obj is not None and obj.username == request.user.username:
            return (
                (None, {
                    'fields': ('username', 'nickname', 'email', 'bio', 'avatar_url')
                }),
            )
        return (
            (None, {
                'fields': ('username', 'nickname', 'email', 'bio', 'avatar_url')
            }),
        )
    def get_list_display(self, request):
        if request.user.is_superuser:
            return ('username', 'nickname', 'email', 'bio', 'avatar_url', 'created_at')
        return ('username', 'nickname', 'email', 'bio', 'avatar_url')
    def get_search_fields(self, request):
        if request.user.is_superuser:
            return ('username', 'nickname', 'email', 'bio', 'avatar_url')
        return ('username', 'nickname', 'email')

# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Doll, DollAdmin)
admin.site.register(Tag, TagAdmin)
admin.site.register(DollTag)
admin.site.register(Follow)
