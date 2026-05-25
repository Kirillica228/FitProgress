from django.conf import settings
from django.db import models


class MuscleGroup(models.Model):
    """Группа мышц (грудь, бицепс, квадрицепс и т.д.)."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Exercise(models.Model):
    name = models.CharField(max_length=100)
    part_body = models.CharField(max_length=100)
    equipment = models.CharField(max_length=100,blank=True,null=True)
    main_muscles = models.CharField(max_length=200)
    accessory_muscles = models.CharField(max_length=200)
    muscle_groups = models.ManyToManyField(
        MuscleGroup,
        blank=True,
        related_name='exercises',
    )

    def __str__(self):
        return self.name


class Workout(models.Model):
    TYPE_CHOICES = [
        ('strength', 'Силовая'),
        ('cardio', 'Кардио'),
        ('home', 'Дома'),
    ]


    DIFFICULTY_CHOICES = [
        ('beginner', 'Начинающий'),
        ('intermediate', 'Средний'),
        ('advanced', 'Продвинутый'),
    ]

    name = models.CharField(max_length=150)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')


class WorkoutExercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name="exercises")
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)

    order = models.IntegerField()
    sets = models.IntegerField()
    reps = models.IntegerField()

    class Meta:
        ordering = ['order']


class WorkoutSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    workout = models.ForeignKey(Workout, on_delete=models.SET_NULL, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    duration = models.IntegerField(null=True, blank=True)  # в минутах
    comment = models.TextField(blank=True)


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
    duration = models.IntegerField(null=True, blank=True)  # секунды
