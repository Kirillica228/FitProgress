from rest_framework import serializers
from ..models import FoodEntry


class FoodEntrySerializer(serializers.ModelSerializer):
    # Алиас для совместимости с фронтендом (ждёт logged_at)
    logged_at = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = FoodEntry
        fields = [
            'id', 'food_name', 'off_product_id',
            'grams', 'calories', 'protein', 'fats', 'carbs',
            'meal_type', 'logged_at',
        ]
        read_only_fields = ['logged_at']


class FoodEntryCreateSerializer(serializers.ModelSerializer):
    """Используется при создании записи вручную (не через бота)."""

    class Meta:
        model = FoodEntry
        fields = [
            'food_name', 'off_product_id',
            'grams', 'calories', 'protein', 'fats', 'carbs',
            'meal_type',
        ]
        extra_kwargs = {
            'food_name': {
                'error_messages': {
                    'required': 'Поле «Название продукта» обязательно для заполнения.',
                    'blank': 'Название продукта не может быть пустым.',
                    'max_length': 'Название продукта не должно превышать 150 символов.',
                },
            },
            'grams': {
                'error_messages': {
                    'required': 'Поле «Граммы» обязательно для заполнения.',
                    'invalid': 'Введите корректное количество граммов.',
                    'null': 'Количество граммов не может быть пустым.',
                },
            },
            'calories': {
                'error_messages': {
                    'required': 'Поле «Калории» обязательно для заполнения.',
                    'invalid': 'Введите корректное значение калорий.',
                },
            },
            'protein': {
                'error_messages': {
                    'required': 'Поле «Белки» обязательно для заполнения.',
                    'invalid': 'Введите корректное значение белков.',
                },
            },
            'fats': {
                'error_messages': {
                    'required': 'Поле «Жиры» обязательно для заполнения.',
                    'invalid': 'Введите корректное значение жиров.',
                },
            },
            'carbs': {
                'error_messages': {
                    'required': 'Поле «Углеводы» обязательно для заполнения.',
                    'invalid': 'Введите корректное значение углеводов.',
                },
            },
            'meal_type': {
                'error_messages': {
                    'required': 'Поле «Тип приёма пищи» обязательно для заполнения.',
                    'invalid_choice': '«{input}» — недопустимый тип приёма пищи. Допустимые значения: завтрак, обед, ужин, перекус.',
                },
            },
        }

    def validate_grams(self, value):
        if value <= 0:
            raise serializers.ValidationError('Количество граммов должно быть больше нуля.')
        if value > 10000:
            raise serializers.ValidationError('Количество граммов не может превышать 10 000.')
        return value

    def validate_calories(self, value):
        if value < 0:
            raise serializers.ValidationError('Калории не могут быть отрицательными.')
        return value

    def validate_protein(self, value):
        if value < 0:
            raise serializers.ValidationError('Белки не могут быть отрицательными.')
        return value

    def validate_fats(self, value):
        if value < 0:
            raise serializers.ValidationError('Жиры не могут быть отрицательными.')
        return value

    def validate_carbs(self, value):
        if value < 0:
            raise serializers.ValidationError('Углеводы не могут быть отрицательными.')
        return value
