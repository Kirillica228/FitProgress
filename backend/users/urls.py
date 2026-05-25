from django.urls import path

from .views import ProfileView, ProfileCreateView

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/create/', ProfileCreateView.as_view(), name='profile-create'),
]
