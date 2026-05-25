from django.urls import path

from .views import MeasurementListView

urlpatterns = [
    path('measurements/', MeasurementListView.as_view(), name='measurement-list'),
]
