from django.urls import path

from .views import (
    WorkoutListView,
    WorkoutDetailView,
    WorkoutSessionListView,
    WorkoutHeatmapView,
)

urlpatterns = [
    path('workouts/', WorkoutListView.as_view(), name='workout-list'),
    path('workouts/<int:pk>/', WorkoutDetailView.as_view(), name='workout-detail'),
    path('workout-sessions/', WorkoutSessionListView.as_view(), name='workout-session-list'),
    path('workout-heatmap/', WorkoutHeatmapView.as_view(), name='workout-heatmap'),
]
