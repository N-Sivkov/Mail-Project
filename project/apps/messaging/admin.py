from django.contrib import admin
from .models import Message, Category, Thread

admin.site.register(Message)
admin.site.register(Category)
admin.site.register(Thread)
