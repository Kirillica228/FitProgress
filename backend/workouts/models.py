from django.conf import settings
from django.db import models


class MuscleGroup(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Exercise(models.Model):
    name = models.CharField(max_length=100)
    equipment = models.CharField(max_length=100, blank=True, null=True)
    muscle_groups = models.ManyToManyField(
        MuscleGroup,
        blank=True,
        related_name='exercises',
    )

    def __str__(self):
        return self.name


class WorkoutSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    duration = models.IntegerField(null=True, blank=True)


class WorkoutSessionExercise(models.Model):
    session = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE, related_name="exercises")
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    order = models.IntegerField()

    class Meta:
        ordering = ['order']


class Set(models.Model):
    session_exercise = models.ForeignKey(
        WorkoutSessionExercise,
        on_delete=models.CASCADE,
        related_name="sets"
    )
    reps = models.IntegerField()
    weight = models.FloatField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True)
