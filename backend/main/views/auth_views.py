from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from ..serializers.auth_serializers import LoginSerializer, RegisterSerializer


# ── helpers ──────────────────────────────────────────────────────────────────

def _is_prod() -> bool:
    return not settings.DEBUG


def _set_auth_cookies(response: Response, refresh: RefreshToken) -> None:
    """Записывает access и refresh токены в httpOnly cookies."""
    is_prod = _is_prod()

    response.set_cookie(
        "fp_access",
        str(refresh.access_token),
        max_age=60 * 60,          # 1 час
        httponly=True,
        secure=is_prod,
        samesite="Lax",
        path="/",
    )
    response.set_cookie(
        "fp_refresh",
        str(refresh),
        max_age=60 * 60 * 24 * 7,  # 7 дней
        httponly=True,
        secure=is_prod,
        samesite="Lax",
        path="/",
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("fp_access", path="/")
    response.delete_cookie("fp_refresh", path="/")


# ── Views ─────────────────────────────────────────────────────────────────────

class UserLogin(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)

        response = Response({
            "ok": True,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })
        _set_auth_cookies(response, refresh)
        return response


class UserRegister(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        response = Response({
            "ok": True,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)
        _set_auth_cookies(response, refresh)
        return response


class UserLogout(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Пытаемся занести refresh в blacklist (если включён)
        raw_refresh = request.COOKIES.get("fp_refresh")
        if raw_refresh:
            try:
                token = RefreshToken(raw_refresh)
                token.blacklist()
            except (TokenError, InvalidToken, AttributeError):
                pass  # blacklist не включён или токен уже невалиден

        response = Response({"ok": True})
        _clear_auth_cookies(response)
        return response


class UserMe(APIView):
    """Возвращает данные текущего пользователя по cookie."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "vk_id": user.vk_id,
        })


class CookieTokenRefreshView(APIView):
    """Обновляет access token, читая refresh из cookie, и пишет новый access обратно."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw_refresh = request.COOKIES.get("fp_refresh")
        if not raw_refresh:
            return Response(
                {"detail": "Refresh token не найден в cookie."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(raw_refresh)
            # Rotate refresh token (если ROTATE_REFRESH_TOKENS=True в настройках)
            new_refresh = refresh
            try:
                refresh.blacklist()
                new_refresh = RefreshToken.for_user(refresh.user)  # type: ignore[attr-defined]
            except (AttributeError, Exception):
                pass  # rotation не включён

            response = Response({"ok": True})
            _set_auth_cookies(response, new_refresh)
            return response

        except (TokenError, InvalidToken):
            response = Response(
                {"detail": "Refresh token недействителен или истёк."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            _clear_auth_cookies(response)
            return response
