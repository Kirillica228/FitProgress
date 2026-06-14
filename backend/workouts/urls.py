from django.urls import path

from .views import (
    WorkoutSessionListView,
    WorkoutHeatmapView,
    WorkoutDayDetailView,
    ActivityTodayView,
)

urlpatterns = [
    path('workout-sessions/', WorkoutSessionListView.as_view(), name='workout-session-list'),
    path('workout-heatmap/', WorkoutHeatmapView.as_view(), name='workout-heatmap'),
    path('workout-day/', WorkoutDayDetailView.as_view(), name='workout-day-detail'),
    path('activity/today/', ActivityTodayView.as_view(), name='activity-today'),
]
