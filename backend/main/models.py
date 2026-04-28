from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    pass

class Profile(models.Model):
    GOAL_CHOICES = [
        ('bulk', 'Mass Gain'),
        ('cut', 'Cut'),
        ('maintain', 'Maintain'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    height = models.IntegerField()
    weight = models.IntegerField()
    age = models.IntegerField()
    goal = models.CharField(max_length=20, choices=GOAL_CHOICES)


class Workout(models.Model):
    TYPE_CHOICES = [
        ('strength', 'Strength'),
        ('cardio', 'Cardio'),
        ('home', 'Home'),
    ]

    GOAL_CHOICES = [
        ('bulk', 'Mass Gain'),
        ('cut', 'Cut'),
        ('maintain', 'Maintain'),
    ]

    name = models.CharField(max_length=150)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    goal_type = models.CharField(max_length=20, choices=GOAL_CHOICES)


class Exercise(models.Model):
    name = models.CharField(max_length=100)
    part_body = models.CharField(max_length=100)
    equipment = models.CharField(max_length=100)
    main_muscles = models.CharField(max_length=200)
    accessory_muscles = models.CharField(max_length=200)


class WorkoutExercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name="exercises")
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    
    order = models.IntegerField()  # порядок выполнения
    sets = models.IntegerField()   # план подходов
    reps = models.IntegerField()   # план повторений

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

    # для кардио можно будет использовать
    duration = models.IntegerField(null=True, blank=True)  # секунды


class BodyMeasurement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    weight = models.FloatField()

    chest = models.FloatField(null=True, blank=True)
    waist = models.FloatField(null=True, blank=True)
    hips = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

class Food(models.Model):
    name = models.CharField(max_length=150)

    calories = models.IntegerField()

    protein = models.FloatField()
    fats = models.FloatField()
    carbs = models.FloatField()


class FoodEntry(models.Model):
    MEAL_TYPES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snack'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    food = models.ForeignKey(Food, on_delete=models.CASCADE)

    grams = models.FloatField()

    meal_type = models.CharField(max_length=20, choices=MEAL_TYPES)

    created_at = models.DateTimeField(auto_now_add=True)


class Goal(models.Model):
    GOAL_TYPES = [
        ('weight', 'Weight'),
        ('calories', 'Calories'),
        ('workouts_per_week', 'Workouts Per Week'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    type = models.CharField(max_length=50, choices=GOAL_TYPES)

    target_value = models.FloatField()

    current_value = models.FloatField(default=0)

    deadline = models.DateField(null=True, blank=True)