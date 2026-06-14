from django.contrib import admin

from .models import (
    MuscleGroup,
    Exercise,
    WorkoutSession,
    WorkoutSessionExercise,
    Set,
)


@admin.register(MuscleGroup)
class MuscleGroupAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['name', 'equipment']
    list_filter = ['equipment']
    search_fields = ['name']
    filter_horizontal = ['muscle_groups']
    fieldsets = (
        (None, {'fields': ('name', 'equipment')}),
        ('Мышцы', {'fields': ('muscle_groups',)}),
    )


class WorkoutSessionExerciseInline(admin.TabularInline):
    model = WorkoutSessionExercise
    extra = 0
    fields = ['exercise', 'order']
    ordering = ['order']
    show_change_link = True


@admin.register(WorkoutSession)
class WorkoutSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'duration']
    list_filter = ['created_at']
    search_fields = ['user__username']
    raw_id_fields = ['user']
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
