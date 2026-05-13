from rest_framework import serializers
from ..models import Goal

# Человекочитаемые названия типов целей
_GOAL_TYPE_LABELS = {
    'weight': 'Вес',
    'calories': 'Калории',
    'workouts_per_week': 'Тренировок в неделю',
}


class GoalSerializer(serializers.ModelSerializer):
    # Алиасы для совместимости с фронтендом
    title = serializers.SerializerMethodField()
    target = serializers.CharField(source='target_value', read_only=True)
    current = serializers.CharField(source='current_value', read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = [
            'id', 'type', 'title',
            'target_value', 'current_value',
            'target', 'current',
            'progress', 'deadline',
        ]

    def get_title(self, obj) -> str:
        return _GOAL_TYPE_LABELS.get(obj.type) or obj.type

    def get_progress(self, obj) -> int:
        """Прогресс в процентах (0–100)."""
        if not obj.target_value:
            return 0
        pct = (obj.current_value / obj.target_value) * 100
        return min(100, max(0, round(pct)))


class GoalCreateSerializer(serializers.ModelSerializer):
    """Используется при создании цели."""

    class Meta:
        model = Goal
        fields = ['type', 'target_value', 'current_value', 'deadline']
        extra_kwargs = {
            'type': {
                'error_messages': {
                    'required': 'Поле «Тип цели» обязательно для заполнения.',
                    'invalid_choice': '«{input}» — недопустимый тип цели. Допустимые значения: вес, калории, тренировок в неделю.',
                },
            },
            'target_value': {
                'error_messages': {
                    'required': 'Поле «Целевое значение» обязательно для заполнения.',
                    'invalid': 'Введите корректное целевое значение.',
                    'null': 'Целевое значение не может быть пустым.',
                },
            },
            'current_value': {
                'error_messages': {
                    'invalid': 'Введите корректное текущее значение.',
                },
            },
            'deadline': {
                'error_messages': {
                    'invalid': 'Введите корректную дату дедлайна в формате ГГГГ-ММ-ДД.',
                },
            },
        }

    def validate_target_value(self, value):
        if value <= 0:
            raise serializers.ValidationError('Целевое значение должно быть больше нуля.')
        return value

    def validate_current_value(self, value):
        if value < 0:
            raise serializers.ValidationError('Текущее значение не может быть отрицательным.')
        return value
