from rest_framework import viewsets
from .models import Message
from django.db import models
from .serializers import MessageModelSerializer

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageModelSerializer

    def get_queryset(self):
        user = self.request.user
        category_id = self.request.query_params.get('category')
        
        queryset = Message.objects.filter(models.Q(sender=user) | models.Q(recipient=user))
        
        if category_id:
            queryset = queryset.filter(category_id=category_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)