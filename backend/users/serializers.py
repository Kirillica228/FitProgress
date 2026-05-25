from rest_framework import serializers
from django.contrib.auth import authenticate

from .models import User, Profile


# ── Auth serializers ──────────────────────────────────────────────────────────

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


# ── Profile serializers ───────────────────────────────────────────────────────

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    vk_id = serializers.IntegerField(source='user.vk_id', read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'username', 'email', 'vk_id',
            'first_name', 'last_name',
            'height', 'weight', 'age',
            'goal',
        ]


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['first_name', 'last_name', 'height', 'weight', 'age', 'goal']
        extra_kwargs = {
            'first_name': {
                'required': False,
                'error_messages': {
                    'blank': 'Имя не может быть пустым.',
                    'max_length': 'Имя не должно превышать 100 символов.',
                },
            },
            'last_name': {
                'required': False,
                'error_messages': {
                    'max_length': 'Фамилия не должна превышать 100 символов.',
                },
            },
            'height': {
                'required': False,
                'allow_null': True,
                'error_messages': {
                    'invalid': 'Введите корректное значение роста (в сантиметрах).',
                    'min_value': 'Рост не может быть меньше 50 см.',
                    'max_value': 'Рост не может превышать 300 см.',
                },
            },
            'weight': {
                'required': False,
                'allow_null': True,
                'error_messages': {
                    'invalid': 'Введите корректное значение веса (в килограммах).',
                    'min_value': 'Вес не может быть меньше 20 кг.',
                    'max_value': 'Вес не может превышать 500 кг.',
                },
            },
            'age': {
                'required': False,
                'allow_null': True,
                'error_messages': {
                    'invalid': 'Введите корректный возраст.',
                    'min_value': 'Возраст не может быть меньше 10 лет.',
                    'max_value': 'Возраст не может превышать 120 лет.',
                },
            },
            'goal': {
                'required': False,
                'error_messages': {
                    'invalid_choice': '«{input}» — недопустимое значение цели. Выберите один из вариантов: набор массы, сушка, поддержание формы.',
                },
            },
        }

    def validate_height(self, value):
        if value is not None and (value < 50 or value > 300):
            raise serializers.ValidationError('Рост должен быть в диапазоне от 50 до 300 см.')
        return value

    def validate_weight(self, value):
        if value is not None and (value < 20 or value > 500):
            raise serializers.ValidationError('Вес должен быть в диапазоне от 20 до 500 кг.')
        return value

    def validate_age(self, value):
        if value is not None and (value < 10 or value > 120):
            raise serializers.ValidationError('Возраст должен быть в диапазоне от 10 до 120 лет.')
        return value
