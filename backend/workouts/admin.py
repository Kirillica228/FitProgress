from django.contrib import admin

from .models import (
    MuscleGroup,
    Exercise,
    Workout,
    WorkoutExercise,
    WorkoutSession,
    WorkoutSessionExercise,
    Set,
)


@admin.register(MuscleGroup)
class MuscleGroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


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


class WorkoutExerciseInline(admin.TabularInline):
    model = WorkoutExercise
    extra = 1
    fields = ['exercise', 'order', 'sets', 'reps']
    ordering = ['order']


@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'difficulty']
    list_filter = ['type', 'difficulty']
    search_fields = ['name']
    inlines = [WorkoutExerciseInline]


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
