from django.db import models
from apps.users.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    
    subject = models.CharField(max_length=255, verbose_name="Тема письма")
    text = models.TextField(verbose_name="Содержимое письма") 
    
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='messages')
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.subject} (от {self.sender.username})"