import uuid

from django.conf import settings
from django.db import models


class FoodEntry(models.Model):
    MEAL_TYPES = [
        ('breakfast', 'Завтрак'),
        ('lunch', 'Обед'),
        ('dinner', 'Ужин'),
        ('snack', 'Перекус'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    food_name = models.CharField(max_length=200)
    fdc_id = models.IntegerField(null=True, blank=True, help_text="ID продукта из FoodData Central")
    grams = models.FloatField(default=100, help_text="Количество грамм")
    calories = models.FloatField()
    protein = models.FloatField(default=0, help_text="Белки (г)")

    fats = models.FloatField(default=0, help_text="Жиры (г)")
    carbs = models.FloatField(default=0, help_text="Углеводы (г)")
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPES)
    meal_group = models.UUIDField(
        null=True, blank=True,
        help_text="UUID для группировки продуктов в один приём пищи",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.food_name} ({self.grams}г) — {self.calories} ккал"
