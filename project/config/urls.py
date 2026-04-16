from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

from apps.users.views import SignupAPIView, LoginAPIView, UserViewSet
from apps.messaging.views import MessageViewSet

schema_view = get_schema_view(
   openapi.Info(
      title="Mail API",
      default_version='v1',
      description="API for Angular Mail App",
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/auth/signup/', SignupAPIView.as_view(), name='signup'),
    path('api/auth/login/', LoginAPIView.as_view(), name='login'),
    
    path('api/', include(router.urls)),
    
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
