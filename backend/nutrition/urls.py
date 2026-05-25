from django.urls import path

from .views import FoodEntryListView, FoodEntryDetailView, NutritionHeatmapView

urlpatterns = [
    path('food-entries/', FoodEntryListView.as_view(), name='food-entry-list'),
    path('food-entries/<int:pk>/', FoodEntryDetailView.as_view(), name='food-entry-detail'),
    path('nutrition-heatmap/', NutritionHeatmapView.as_view(), name='nutrition-heatmap'),
]
