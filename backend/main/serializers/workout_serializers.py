from rest_framework import serializers
from ..models import (
    Exercise,
    MuscleGroup,
    Workout,
    WorkoutExercise,
    WorkoutSession,
    WorkoutSessionExercise,
    Set,
)


class MuscleGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuscleGroup
        fields = ['id', 'name', 'slug']


class ExerciseSerializer(serializers.ModelSerializer):
    muscle_groups = MuscleGroupSerializer(many=True, read_only=True)

    class Meta:
        model = Exercise
        fields = [
            'id', 'name', 'part_body', 'equipment',
            'main_muscles', 'accessory_muscles', 'muscle_groups',
        ]


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)

    class Meta:
        model = WorkoutExercise
        fields = ['id', 'exercise', 'order', 'sets', 'reps']


class WorkoutSerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseSerializer(many=True, read_only=True)
    # Алиас для совместимости с фронтендом (ждёт title)
    title = serializers.CharField(source='name', read_only=True)

    class Meta:
        model = Workout
        fields = ['id', 'name', 'title', 'type', 'goal_type', 'difficulty', 'exercises']


class WorkoutCreateSerializer(serializers.ModelSerializer):
    """Используется при создании тренировки."""

    class Meta:
        model = Workout
        fields = ['name', 'type', 'goal_type', 'difficulty']
        extra_kwargs = {
            'name': {
                'error_messages': {
                    'required': 'Поле «Название тренировки» обязательно для заполнения.',
                    'blank': 'Название тренировки не может быть пустым.',
                    'max_length': 'Название тренировки не должно превышать 150 символов.',
                },
            },
            'type': {
                'error_messages': {
                    'required': 'Поле «Тип тренировки» обязательно для заполнения.',
                    'invalid_choice': '«{input}» — недопустимый тип тренировки. Допустимые значения: силовая, кардио, дома.',
                },
            },
            'goal_type': {
                'error_messages': {
                    'required': 'Поле «Цель тренировки» обязательно для заполнения.',
                    'invalid_choice': '«{input}» — недопустимая цель тренировки.',
                },
            },
            'difficulty': {
                'error_messages': {
                    'invalid_choice': '«{input}» — недопустимый уровень сложности. Допустимые значения: начинающий, средний, продвинутый.',
                },
            },
        }


class SetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Set
        fields = ['id', 'reps', 'weight', 'duration']
        extra_kwargs = {
            'reps': {
                'error_messages': {
                    'required': 'Поле «Повторения» обязательно для заполнения.',
                    'invalid': 'Введите корректное количество повторений.',
                    'min_value': 'Количество повторений должно быть больше нуля.',
                },
            },
            'weight': {
                'error_messages': {
                    'invalid': 'Введите корректное значение веса.',
                    'min_value': 'Вес не может быть отрицательным.',
                },
            },
            'duration': {
                'error_messages': {
                    'invalid': 'Введите корректную длительность (в секундах).',
                    'min_value': 'Длительность должна быть больше нуля.',
                },
            },
        }

    def validate_reps(self, value):
        if value <= 0:
            raise serializers.ValidationError('Количество повторений должно быть больше нуля.')
        return value

    def validate_weight(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('Вес не может быть отрицательным.')
        return value

    def validate_duration(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError('Длительность должна быть больше нуля.')
        return value


class WorkoutSessionExerciseSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    sets = SetSerializer(many=True, read_only=True)

    class Meta:
        model = WorkoutSessionExercise
        fields = ['id', 'exercise', 'order', 'sets']


class WorkoutSessionSerializer(serializers.ModelSerializer):
    exercises = WorkoutSessionExerciseSerializer(many=True, read_only=True)
    # Вложенный объект тренировки для фронтенда
    workout = WorkoutSerializer(read_only=True)
    # Алиасы для совместимости с фронтендом
    started_at = serializers.DateTimeField(source='created_at', read_only=True)
    finished_at = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutSession
        fields = [
            'id', 'workout',
            'started_at', 'finished_at',
            'duration', 'comment', 'exercises',
        ]
        read_only_fields = ['started_at']
        extra_kwargs = {
            'duration': {
                'error_messages': {
                    'invalid': 'Введите корректную длительность сессии (в минутах).',
                    'min_value': 'Длительность сессии должна быть больше нуля.',
                },
            },
            'comment': {
                'error_messages': {
                    'max_length': 'Комментарий слишком длинный.',
                },
            },
        }

    def get_finished_at(self, obj) -> str | None:
        """
        Модель не хранит finished_at — вычисляем из created_at + duration (мин).
        Если duration не задан, возвращаем None.
        """
        if obj.duration is None:
            return None
        from datetime import timedelta
        finished = obj.created_at + timedelta(minutes=obj.duration)
        return finished.isoformat()

    def validate_duration(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError('Длительность сессии должна быть больше нуля.')
        return value
