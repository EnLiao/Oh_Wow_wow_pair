from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User, Doll, Tag, Follow

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username', 'nickname', 'email', 'bio', 'avatar_image')

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ('username', 'nickname', 'email', 'bio', 'avatar_image')
class DollAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'birthday')
    filter_horizontal = ('tag',)

class TagAdmin(admin.ModelAdmin):
    pass

class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    list_display = ('username', 'nickname', 'email', 'bio', 'created_at')
    search_fields = ('username', 'nickname', 'email')
    ordering = ('-created_at',)
    list_filter = ('is_staff',)
    fieldsets = (
        (None, {
            'fields': ('username', 'nickname', 'email', 'bio')
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
                    'fields': ('username', 'nickname', 'email', 'bio')
                }),
            )
        return (
            (None, {
                'fields': ('username', 'nickname', 'email', 'bio')
            }),
        )
    def get_list_display(self, request):
        if request.user.is_superuser:
            return ('username', 'nickname', 'email', 'bio', 'created_at')
        return ('username', 'nickname', 'email', 'bio')
    def get_search_fields(self, request):
        if request.user.is_superuser:
            return ('username', 'nickname', 'email', 'bio')
        return ('username', 'nickname', 'email')

# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Doll, DollAdmin)
admin.site.register(Tag, TagAdmin)

admin.site.register(Follow)
