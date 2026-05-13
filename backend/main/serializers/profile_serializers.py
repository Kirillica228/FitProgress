from rest_framework import serializers
from ..models import Profile, User


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
