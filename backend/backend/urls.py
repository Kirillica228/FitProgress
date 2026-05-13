from django.contrib import admin
from django.urls import path, include
from main.views.auth_views import (
    UserRegister,
    UserLogin,
    UserLogout,
    UserMe,
    CookieTokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Авторизация — публичные эндпоинты
    path('auth/register/', UserRegister.as_view(), name='register'),
    path('auth/login/', UserLogin.as_view(), name='login'),
    path('auth/logout/', UserLogout.as_view(), name='logout'),
    path('auth/me/', UserMe.as_view(), name='me'),
    path('auth/refresh/', CookieTokenRefreshView.as_view(), name='token-refresh'),

    # API для фронтенда (cookie JWT)
    path('api/', include('main.urls.api')),
]
