"""
CookieJWTAuthentication — читает JWT access token из httpOnly cookie fp_access.
Используется как DEFAULT_AUTHENTICATION_CLASSES в settings.py.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class CookieJWTAuthentication(JWTAuthentication):
    """Берёт access token из cookie fp_access вместо заголовка Authorization."""

    def authenticate(self, request):
        raw_token = request.COOKIES.get("fp_access")
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
        except (InvalidToken, TokenError):
            return None

        return self.get_user(validated_token), validated_token
