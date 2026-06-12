from django.urls import path

from .views import FoodEntryListView, FoodEntryDetailView, NutritionHeatmapView, NutritionDayDetailView

urlpatterns = [
    path('food-entries/', FoodEntryListView.as_view(), name='food-entry-list'),
    path('food-entries/<int:pk>/', FoodEntryDetailView.as_view(), name='food-entry-detail'),
    path('nutrition-heatmap/', NutritionHeatmapView.as_view(), name='nutrition-heatmap'),
    path('nutrition-day/', NutritionDayDetailView.as_view(), name='nutrition-day-detail'),
]
