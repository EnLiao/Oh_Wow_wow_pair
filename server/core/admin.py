from django.contrib import admin
from .models import User, Doll, DollTag, Tag

# Register your models here.
admin.site.register(User)
admin.site.register(Doll)
admin.site.register(Tag)
admin.site.register(DollTag)
