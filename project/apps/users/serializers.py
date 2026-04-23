from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class SignupSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3,max_length=150)
    password = serializers.CharField(min_length=8,write_only=True)
    email = serializers.EmailField(min_length=4,required=False)

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3,max_length=150)
    password = serializers.CharField(min_length=8,write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Неверные учетные данные")

class UserModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'bio']