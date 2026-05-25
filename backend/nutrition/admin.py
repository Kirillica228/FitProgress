from django.contrib import admin

from .models import FoodEntry


@admin.register(FoodEntry)
class FoodEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'food_name', 'meal_type', 'calories', 'created_at']
    list_filter = ['meal_type', 'created_at']
    search_fields = ['user__username', 'food_name']
    raw_id_fields = ['user']
    date_hierarchy = 'created_at'
