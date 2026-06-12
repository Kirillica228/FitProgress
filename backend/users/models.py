from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    vk_id = models.BigIntegerField(null=True, blank=True, unique=True)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    calorie_goal = models.IntegerField(null=True, blank=True)
    protein_goal = models.IntegerField(null=True, blank=True)
    fat_goal = models.IntegerField(null=True, blank=True)
    carbs_goal = models.IntegerField(null=True, blank=True)
