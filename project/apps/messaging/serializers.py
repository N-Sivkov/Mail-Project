from rest_framework import serializers
from .models import Message, Category

class MessageModelSerializer(serializers.ModelSerializer):
    senderId = serializers.ReadOnlyField(source='sender.id')
    name = serializers.CharField(source='subject')
    content = serializers.CharField(source='text') 
    date = serializers.DateTimeField(source='created_at', format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'senderId', 'name', 'date', 'content', 'recipient', 'category']