from django.contrib import admin
from .models import Message, Category

admin.site.register(Message)
admin.site.register(Category)