from rest_framework import serializers
from django.db.models import Q
from .models import Message, Category, Thread
from apps.users.models import User

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'route']


class ThreadSerializer(serializers.ModelSerializer):
    participants = serializers.SlugRelatedField(many=True, read_only=True, slug_field='username')
    messageCount = serializers.SerializerMethodField()
    lastMessageSubject = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = ['id', 'participants', 'messageCount', 'lastMessageSubject']

    def get_lastMessageSubject(self, obj):
        latest_message = obj.messages.order_by('-created_at').first()
        return latest_message.subject if latest_message else ''

    def get_messageCount(self, obj):
        return obj.messages.count()

class MessageModelSerializer(serializers.ModelSerializer):
    senderId = serializers.ReadOnlyField(source='sender.id')
    sender = serializers.ReadOnlyField(source='sender.username') 

    recipientIds = serializers.PrimaryKeyRelatedField(
        source='recipients', queryset=User.objects.all(), many=True
    )
    recipients = serializers.SlugRelatedField(
         many=True, read_only=True, slug_field='username'
    )
    
    copyRecipientIds = serializers.PrimaryKeyRelatedField(
        source='copy_recipients', queryset=User.objects.all(), many=True, required=False
    )
    copyRecipients = serializers.SlugRelatedField(
        source='copy_recipients', many=True, read_only=True, slug_field='username'
    )
    
    date = serializers.DateTimeField(source='created_at', format="%Y-%m-%d %H:%M:%S", read_only=True)
    content = serializers.CharField(source='text')
    read = serializers.BooleanField(source='is_read', default=False)
    isSpam = serializers.BooleanField(source='is_spam', default=False)
    threadId = serializers.ReadOnlyField(source='thread.id')
    replyToMessageId = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    categoryId = serializers.SerializerMethodField()
    existsAt = serializers.ListField(source='exists_at', child=serializers.IntegerField(), read_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 
            'senderId', 'sender', 
            'recipientIds', 'recipients', 
            'copyRecipientIds', 'copyRecipients', 
            'subject', 'date', 'content', 'read',
            'isSpam', 'categoryId', 'threadId', 'replyToMessageId', 'existsAt'
        ]

    def create(self, validated_data):
        request = self.context['request']
        recipients = validated_data.pop('recipients', [])
        copy_recipients = validated_data.pop('copy_recipients', [])
        reply_to_message_id = validated_data.pop('replyToMessageId', None)

        thread = None
        if reply_to_message_id:
            thread = self._resolve_thread(reply_to_message_id, request.user)

        message = Message.objects.create(thread=thread, **validated_data)
        message.recipients.set(recipients)
        message.copy_recipients.set(copy_recipients)
        message.exists_at = self._build_exists_at(message.sender_id, recipients, copy_recipients)
        message.save(update_fields=['exists_at'])

        if thread:
            thread.participants.add(message.sender)
            thread.participants.add(*recipients)
            if copy_recipients:
                thread.participants.add(*copy_recipients)

        return message

    def get_categoryId(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user is None or not getattr(user, 'is_authenticated', False):
            return None

        category_route = self._get_category_route_for_user(obj, user)
        if category_route is None:
            return None

        category = Category.objects.filter(route=category_route).first()
        return category.id if category else None

    def _resolve_thread(self, reply_to_message_id, user):
        original_message = Message.objects.filter(
            Q(sender=user) |
            Q(recipients=user) |
            Q(copy_recipients=user),
            pk=reply_to_message_id
        ).distinct().first()

        if original_message is None:
            raise serializers.ValidationError({
                'replyToMessageId': 'Original message not found or unavailable.'
            })

        thread = original_message.thread
        if thread is None:
            thread = Thread.objects.create()
            thread.participants.add(original_message.sender)
            thread.participants.add(*original_message.recipients.all())
            copy_recipients = list(original_message.copy_recipients.all())
            if copy_recipients:
                thread.participants.add(*copy_recipients)
            original_message.thread = thread
            original_message.save(update_fields=['thread'])

        return thread

    def _get_category_route_for_user(self, message, user):
        if message.is_sender(user):
            return 'sent'

        if message.is_recipient(user):
            return 'spam' if message.is_spam else 'inbox'

        return None

    def _build_exists_at(self, sender_id, recipients, copy_recipients):
        user_ids = [sender_id]
        user_ids.extend(user.id for user in recipients)
        user_ids.extend(user.id for user in copy_recipients)
        return list(dict.fromkeys(user_ids))
