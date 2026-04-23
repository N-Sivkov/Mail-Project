from django.db import models
from apps.users.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    route = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.name


class Thread(models.Model):
    participants = models.ManyToManyField(User, related_name='threads')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Thread #{self.pk}"

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    
    recipients = models.ManyToManyField(User, related_name='received_messages')
    copy_recipients = models.ManyToManyField(User, related_name='copied_messages', blank=True)
    
    subject = models.CharField(max_length=255)
    text = models.TextField()
    
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='messages')
    thread = models.ForeignKey(
        Thread,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='messages'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    is_read = models.BooleanField(default=False)
    is_spam = models.BooleanField(default=False)
    exists_at = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.subject} (от {self.sender.username})"

    def is_sender(self, user):
        return self.sender_id == getattr(user, 'id', None)

    def is_recipient(self, user):
        user_id = getattr(user, 'id', None)
        if user_id is None:
            return False

        return (
            self.recipients.filter(id=user_id).exists() or
            self.copy_recipients.filter(id=user_id).exists()
        )
