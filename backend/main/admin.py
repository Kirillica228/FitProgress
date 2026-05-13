from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import (
    User,
    Profile,
    Article,
    MuscleGroup,
    Exercise,
    Workout,
    WorkoutExercise,
    WorkoutSession,
    WorkoutSessionExercise,
    Set,
    BodyMeasurement,
    FoodEntry,
    Goal,
)


# ─── User ─────────────────────────────────────────────────────────────────────

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'vk_id', 'is_staff', 'date_joined']
    list_filter = ['is_staff', 'is_superuser', 'is_active']
    search_fields = ['username', 'email']
    fieldsets = list(BaseUserAdmin.fieldsets or []) + [  # type: ignore[assignment]
        ('VK', {'fields': ('vk_id',)}),
    ]


# ─── Profile ──────────────────────────────────────────────────────────────────

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'first_name', 'last_name', 'weight', 'height', 'age', 'goal']
    search_fields = ['user__username', 'first_name', 'last_name']
    list_filter = ['goal']


# ─── Articles ─────────────────────────────────────────────────────────────────

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'published_at', 'read_time', 'is_published']
    list_filter = ['is_published', 'category']
    list_editable = ['is_published']
    search_fields = ['title', 'excerpt', 'content']
    prepopulated_fields = {'slug': ('title',)}
    ordering = ['-published_at']
    fieldsets = (
        (None, {'fields': ('title', 'slug', 'category', 'published_at', 'read_time', 'is_published')}),
        ('Контент', {'fields': ('excerpt', 'content')}),
    )


# ─── Muscle Groups ────────────────────────────────────────────────────────────

@admin.register(MuscleGroup)
class MuscleGroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


# ─── Exercises ────────────────────────────────────────────────────────────────

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['name', 'part_body', 'equipment', 'main_muscles']
    list_filter = ['part_body', 'equipment']
    search_fields = ['name', 'main_muscles', 'accessory_muscles']
    filter_horizontal = ['muscle_groups']
    fieldsets = (
        (None, {'fields': ('name', 'part_body', 'equipment')}),
        ('Мышцы', {'fields': ('main_muscles', 'accessory_muscles', 'muscle_groups')}),
    )


# ─── Workouts ─────────────────────────────────────────────────────────────────

class WorkoutExerciseInline(admin.TabularInline):
    model = WorkoutExercise
    extra = 1
    fields = ['exercise', 'order', 'sets', 'reps']
    ordering = ['order']


@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'goal_type', 'difficulty']
    list_filter = ['type', 'goal_type', 'difficulty']
    search_fields = ['name']
    inlines = [WorkoutExerciseInline]


# ─── Workout Sessions ─────────────────────────────────────────────────────────

class WorkoutSessionExerciseInline(admin.TabularInline):
    model = WorkoutSessionExercise
    extra = 0
    fields = ['exercise', 'order']
    ordering = ['order']
    show_change_link = True


@admin.register(WorkoutSession)
class WorkoutSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'workout', 'created_at', 'duration', 'comment']
    list_filter = ['created_at']
    search_fields = ['user__username', 'workout__name']
    raw_id_fields = ['user', 'workout']
    inlines = [WorkoutSessionExerciseInline]
    date_hierarchy = 'created_at'


class SetInline(admin.TabularInline):
    model = Set
    extra = 0
    fields = ['reps', 'weight', 'duration']


@admin.register(WorkoutSessionExercise)
class WorkoutSessionExerciseAdmin(admin.ModelAdmin):
    list_display = ['session', 'exercise', 'order']
    raw_id_fields = ['session', 'exercise']
    inlines = [SetInline]


# ─── Body Measurements ────────────────────────────────────────────────────────

@admin.register(BodyMeasurement)
class BodyMeasurementAdmin(admin.ModelAdmin):
    list_display = ['user', 'weight', 'chest', 'waist', 'hips', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username']
    raw_id_fields = ['user']
    date_hierarchy = 'created_at'


# ─── Food Entries ─────────────────────────────────────────────────────────────

@admin.register(FoodEntry)
class FoodEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'food_name', 'meal_type', 'calories', 'created_at']
    list_filter = ['meal_type', 'created_at']
    search_fields = ['user__username', 'food_name']
    raw_id_fields = ['user']
    date_hierarchy = 'created_at'


# ─── Goals ────────────────────────────────────────────────────────────────────

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['user', 'type', 'target_value', 'current_value', 'deadline']
    list_filter = ['type']
    search_fields = ['user__username']
    raw_id_fields = ['user']
