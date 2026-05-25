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
