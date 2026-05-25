from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Profile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'vk_id', 'is_staff', 'date_joined']
    list_filter = ['is_staff', 'is_superuser', 'is_active']
    search_fields = ['username', 'email']
    fieldsets = list(BaseUserAdmin.fieldsets or []) + [  # type: ignore[assignment]
        ('VK', {'fields': ('vk_id',)}),
    ]


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'first_name', 'last_name', 'weight', 'height', 'age', 'goal']
    search_fields = ['user__username', 'first_name', 'last_name']
    list_filter = ['goal']
