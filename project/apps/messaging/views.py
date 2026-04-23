from django.db import models
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Message, Category, Thread
from .serializers import MessageModelSerializer, CategorySerializer, ThreadSerializer
from apps.users.models import User
from apps.users.serializers import UserModelSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ThreadViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ThreadSerializer

    def get_queryset(self):
        return Thread.objects.filter(participants=self.request.user).distinct().order_by('-created_at')


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageModelSerializer

    def get_queryset(self):
        user = self.request.user
        category_id = self.request.query_params.get('category')
        sender_id = self.request.query_params.get('sender')
        recipient_id = self.request.query_params.get('recipient')
        thread_id = self.request.query_params.get('thread')

        queryset = Message.objects.filter(
            models.Q(sender=user) | 
            models.Q(recipients=user) | 
            models.Q(copy_recipients=user)
        ).distinct() 

        visible_message_ids = [
            message.id for message in queryset
            if user.id in message.exists_at
        ]
        queryset = queryset.filter(id__in=visible_message_ids)

        if category_id:
            category = Category.objects.filter(id=category_id).first()
            if category:
                queryset = self._filter_by_category(queryset, category.route, user)
            else:
                queryset = queryset.none()

        if sender_id:
            queryset = queryset.filter(sender_id=sender_id)

        if recipient_id:
            queryset = queryset.filter(
                models.Q(recipients__id=recipient_id) |
                models.Q(copy_recipients__id=recipient_id)
            )

        if thread_id:
            queryset = queryset.filter(thread_id=thread_id)
            
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user_id = request.user.id

        if user_id in instance.exists_at:
            instance.exists_at = [existing_id for existing_id in instance.exists_at if existing_id != user_id]

        if instance.exists_at:
            instance.save(update_fields=['exists_at'])
        else:
            instance.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

    def _filter_by_category(self, queryset, category_route, user):
        if category_route == 'sent':
            return queryset.filter(sender=user)

        if category_route == 'spam':
            return queryset.filter(
                models.Q(recipients=user) | models.Q(copy_recipients=user),
                is_spam=True
            )

        if category_route == 'inbox':
            return queryset.filter(
                models.Q(recipients=user) | models.Q(copy_recipients=user),
                is_spam=False
            )

        return queryset


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def thread_partners_view(request):
    users = User.objects.filter(
        threads__participants=request.user
    ).exclude(
        id=request.user.id
    ).distinct().order_by('username')

    return Response(UserModelSerializer(users, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def threads_by_partner_view(request, user_id):
    partner_exists = User.objects.filter(id=user_id).exists()
    if not partner_exists:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    queryset = Thread.objects.filter(
        participants=request.user
    ).filter(
        participants__id=user_id
    ).distinct().order_by('-created_at')

    return Response(ThreadSerializer(queryset, many=True).data)
