from rest_framework import serializers
from .models import BodyMeasurement


class BodyMeasurementSerializer(serializers.ModelSerializer):
    # Алиас для совместимости с фронтендом (ждёт date как строку YYYY-MM-DD)
    date = serializers.SerializerMethodField()

    class Meta:
        model = BodyMeasurement
        fields = ['id', 'weight', 'chest', 'waist', 'hips', 'date']
        read_only_fields = ['date']
        extra_kwargs = {
            'weight': {
                'error_messages': {
                    'required': 'Поле «Вес» обязательно для заполнения.',
                    'invalid': 'Введите корректное значение веса.',
                    'null': 'Вес не может быть пустым.',
                },
            },
            'chest': {
                'error_messages': {
                    'invalid': 'Введите корректное значение обхвата груди.',
                },
            },
            'waist': {
                'error_messages': {
                    'invalid': 'Введите корректное значение обхвата талии.',
                },
            },
            'hips': {
                'error_messages': {
                    'invalid': 'Введите корректное значение обхвата бёдер.',
                },
            },
        }

    def get_date(self, obj) -> str:
        return obj.created_at.date().isoformat()

    def validate_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError('Вес должен быть больше нуля.')
        if value > 500:
            raise serializers.ValidationError('Вес не может превышать 500 кг.')
        return value

    def validate_chest(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError('Обхват груди должен быть больше нуля.')
        return value

    def validate_waist(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError('Обхват талии должен быть больше нуля.')
        return value

    def validate_hips(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError('Обхват бёдер должен быть больше нуля.')
        return value
