from django.contrib import admin
from .models import User, Doll, DollTag, Tag


class DollAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'birthday')

# Register your models here.
admin.site.register(User)
admin.site.register(Doll, DollAdmin)
admin.site.register(Tag)
admin.site.register(DollTag)
