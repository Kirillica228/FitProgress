from rest_framework import serializers
from .models import (
    Exercise,
    MuscleGroup,
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
        fields = ['id', 'name', 'equipment', 'muscle_groups']


class SetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Set
        fields = ['id', 'reps', 'weight', 'duration']

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
    started_at = serializers.DateTimeField(source='created_at', read_only=True)
    finished_at = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutSession
        fields = [
            'id', 'started_at', 'finished_at',
            'duration', 'comment', 'exercises',
        ]
        read_only_fields = ['started_at']

    def get_finished_at(self, obj) -> str | None:
        if obj.duration is None:
            return None
        from datetime import timedelta
        finished = obj.created_at + timedelta(minutes=obj.duration)
        return finished.isoformat()
