from rest_framework import serializers
from ..models import FoodEntry


class FoodEntrySerializer(serializers.ModelSerializer):
    # Алиас для совместимости с фронтендом (ждёт logged_at)
    logged_at = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = FoodEntry
        fields = ['id', 'food_name', 'calories', 'meal_type', 'logged_at']
        read_only_fields = ['logged_at']


class FoodEntryCreateSerializer(serializers.ModelSerializer):
    """Используется при создании записи питания."""

    class Meta:
        model = FoodEntry
        fields = ['food_name', 'calories', 'meal_type']
        extra_kwargs = {
            'food_name': {
                'error_messages': {
                    'required': 'Поле «Название продукта» обязательно для заполнения.',
                    'blank': 'Название продукта не может быть пустым.',
                    'max_length': 'Название продукта не должно превышать 150 символов.',
                },
            },
            'calories': {
                'error_messages': {
                    'required': 'Поле «Калории» обязательно для заполнения.',
                    'invalid': 'Введите корректное значение калорий.',
                },
            },
            'meal_type': {
                'error_messages': {
                    'required': 'Поле «Тип приёма пищи» обязательно для заполнения.',
                    'invalid_choice': '«{input}» — недопустимый тип. Допустимые: breakfast, lunch, dinner, snack.',
                },
            },
        }

    def validate_calories(self, value):
        if value < 0:
            raise serializers.ValidationError('Калории не могут быть отрицательными.')
        if value > 10000:
            raise serializers.ValidationError('Калории не могут превышать 10 000 ккал.')
        return value
