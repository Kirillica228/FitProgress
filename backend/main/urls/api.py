from django.urls import path
from ..views.profile_views import ProfileView, ProfileCreateView
from ..views.workout_views import (
    WorkoutListView,
    WorkoutDetailView,
    WorkoutSessionListView,
    WorkoutHeatmapView,
)
from ..views.nutrition_views import FoodEntryListView, FoodEntryDetailView
from ..views.measurement_views import MeasurementListView
from ..views.goal_views import GoalListView, GoalDetailView

urlpatterns = [
    # Профиль
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/create/', ProfileCreateView.as_view(), name='profile-create'),

    # Тренировки — каталог
    path('workouts/', WorkoutListView.as_view(), name='workout-list'),
    path('workouts/<int:pk>/', WorkoutDetailView.as_view(), name='workout-detail'),

    # Тренировки — история сессий
    path('workout-sessions/', WorkoutSessionListView.as_view(), name='workout-session-list'),

    # Тренировки — heatmap (GitHub-style активность)
    path('workout-heatmap/', WorkoutHeatmapView.as_view(), name='workout-heatmap'),

    # Питание
    path('food-entries/', FoodEntryListView.as_view(), name='food-entry-list'),
    path('food-entries/<int:pk>/', FoodEntryDetailView.as_view(), name='food-entry-detail'),

    # Замеры тела
    path('measurements/', MeasurementListView.as_view(), name='measurement-list'),

    # Цели
    path('goals/', GoalListView.as_view(), name='goal-list'),
    path('goals/<int:pk>/', GoalDetailView.as_view(), name='goal-detail'),
]
