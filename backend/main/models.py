from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    vk_id = models.BigIntegerField(null=True, blank=True, unique=True)


class Profile(models.Model):
    GOAL_CHOICES = [
        ('gain', 'Набор массы'),
        ('cut', 'Сушка'),
        ('maintain', 'Поддержание формы'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100, blank=True, default='')
    last_name = models.CharField(max_length=100, blank=True, default='')
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    goal = models.CharField(max_length=20, choices=GOAL_CHOICES, blank=True, default='')


class Workout(models.Model):
    TYPE_CHOICES = [
        ('strength', 'Силовая'),
        ('cardio', 'Кардио'),
        ('home', 'Дома'),
    ]

    GOAL_CHOICES = [
        ('bulk', 'Набор массы'),
        ('cut', 'Сушка'),
        ('maintain', 'Поддержание формы'),
    ]

    DIFFICULTY_CHOICES = [
        ('beginner', 'Начинающий'),
        ('intermediate', 'Средний'),
        ('advanced', 'Продвинутый'),
    ]

    name = models.CharField(max_length=150)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    goal_type = models.CharField(max_length=20, choices=GOAL_CHOICES)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')


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
    equipment = models.CharField(max_length=100)
    # Оставляем для обратной совместимости
    main_muscles = models.CharField(max_length=200)
    accessory_muscles = models.CharField(max_length=200)
    # Нормализованные группы мышц (M2M)
    muscle_groups = models.ManyToManyField(
        MuscleGroup,
        blank=True,
        related_name='exercises',
    )


class WorkoutExercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name="exercises")
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)

    order = models.IntegerField()   # порядок выполнения
    sets = models.IntegerField()    # план подходов
    reps = models.IntegerField()    # план повторений

    class Meta:
        ordering = ['order']


class WorkoutSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
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

    # для кардио
    duration = models.IntegerField(null=True, blank=True)  # секунды


class BodyMeasurement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    weight = models.FloatField()

    chest = models.FloatField(null=True, blank=True)
    waist = models.FloatField(null=True, blank=True)
    hips = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)


class FoodEntry(models.Model):
    MEAL_TYPES = [
        ('breakfast', 'Завтрак'),
        ('lunch', 'Обед'),
        ('dinner', 'Ужин'),
        ('snack', 'Перекус'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    food_name = models.CharField(max_length=150)
    calories = models.FloatField()
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class Article(models.Model):
    slug = models.SlugField(max_length=200, unique=True)
    title = models.CharField(max_length=300)
    excerpt = models.TextField(blank=True)
    content = models.TextField()
    category = models.CharField(max_length=100, blank=True)
    published_at = models.DateField(null=True, blank=True)
    read_time = models.CharField(max_length=50, blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title


class Goal(models.Model):
    GOAL_TYPES = [
        ('weight', 'Вес'),
        ('calories', 'Калории'),
        ('workouts_per_week', 'Тренировок в неделю'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    type = models.CharField(max_length=50, choices=GOAL_TYPES)

    target_value = models.FloatField()

    current_value = models.FloatField(default=0)

    deadline = models.DateField(null=True, blank=True)
