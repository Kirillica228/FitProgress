from rest_framework import serializers
from ..models import User
from django.contrib.auth import authenticate


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=6,
        error_messages={
            'min_length': 'Пароль должен содержать не менее 6 символов.',
            'blank': 'Пароль не может быть пустым.',
            'required': 'Поле «Пароль» обязательно для заполнения.',
        },
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
        ]
        extra_kwargs = {
            'username': {
                'min_length': 3,
                'error_messages': {
                    'min_length': 'Имя пользователя должно содержать не менее 3 символов.',
                    'blank': 'Имя пользователя не может быть пустым.',
                    'required': 'Поле «Имя пользователя» обязательно для заполнения.',
                    'unique': 'Пользователь с таким именем уже существует.',
                },
            },
            'email': {
                'error_messages': {
                    'invalid': 'Введите корректный адрес электронной почты.',
                    'blank': 'Адрес электронной почты не может быть пустым.',
                    'required': 'Поле «Email» обязательно для заполнения.',
                    'unique': 'Пользователь с таким email уже зарегистрирован.',
                },
            },
        }

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        return user


class LoginSerializer(serializers.Serializer):

    username = serializers.CharField(
        error_messages={
            'blank': 'Имя пользователя не может быть пустым.',
            'required': 'Поле «Имя пользователя» обязательно для заполнения.',
        },
    )
    password = serializers.CharField(
        write_only=True,
        error_messages={
            'blank': 'Пароль не может быть пустым.',
            'required': 'Поле «Пароль» обязательно для заполнения.',
        },
    )

    def validate(self, attrs):

        user = authenticate(
            username=attrs["username"],
            password=attrs["password"]
        )

        if not user:
            raise serializers.ValidationError(
                'Неверное имя пользователя или пароль.'
            )

        attrs["user"] = user

        return attrs
