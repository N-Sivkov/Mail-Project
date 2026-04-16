from rest_framework import permissions

class IsSenderOrRecipient(permissions.BasePermission):
    """
    Разрешает доступ только отправителю или получателю сообщения.
    """
    def has_object_permission(self, request, view, obj):
        return obj.sender == request.user or obj.recipient == request.user