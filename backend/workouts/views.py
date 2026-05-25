from datetime import date

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Workout, WorkoutSession, WorkoutSessionExercise, Set as WorkoutSet
from .serializers import WorkoutSerializer, WorkoutSessionSerializer


class WorkoutListView(APIView):
    """Каталог готовых тренировок. Поддерживает фильтрацию по type и difficulty."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Workout.objects.prefetch_related('exercises__exercise').all()

        workout_type = request.query_params.get('type')
        difficulty = request.query_params.get('difficulty')

        if workout_type:
            qs = qs.filter(type=workout_type)
        if difficulty:
            qs = qs.filter(difficulty=difficulty)

        serializer = WorkoutSerializer(qs, many=True)
        return Response(serializer.data)


class WorkoutDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            workout = Workout.objects.prefetch_related('exercises__exercise').get(pk=pk)
        except Workout.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = WorkoutSerializer(workout)
        return Response(serializer.data)


class WorkoutSessionListView(APIView):
    """История тренировочных сессий текущего пользователя."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = (
            WorkoutSession.objects
            .filter(user=request.user)
            .prefetch_related('exercises__exercise', 'exercises__sets')
            .select_related('workout')
            .order_by('-created_at')
        )
        serializer = WorkoutSessionSerializer(sessions, many=True)
        return Response(serializer.data)


class WorkoutHeatmapView(APIView):
    """
    Возвращает данные тренировок за год в формате heatmap (GitHub-style).

    GET /api/workout-heatmap/?year=2025
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            year = int(request.query_params.get('year', date.today().year))
        except (ValueError, TypeError):
            year = date.today().year

        year_start = date(year, 1, 1)
        year_end = date(year, 12, 31)

        sessions = (
            WorkoutSession.objects
            .filter(
                user=request.user,
                created_at__date__gte=year_start,
                created_at__date__lte=year_end,
            )
            .prefetch_related('exercises__sets')
            .select_related('workout')
            .order_by('created_at')
        )

        days: dict[str, dict] = {}

        for session in sessions:
            day_key = session.created_at.date().isoformat()

            if day_key not in days:
                days[day_key] = {
                    'date': day_key,
                    'count': 0,
                    'volume': 0,
                    'sessions': [],
                }

            session_exercises = WorkoutSessionExercise.objects.filter(session=session)
            exercises_count = session_exercises.count()

            volume = 0.0
            for se in session_exercises:
                sets_qs = WorkoutSet.objects.filter(session_exercise=se)
                for s in sets_qs:
                    if s.weight is not None and s.weight > 0:
                        volume += s.reps * s.weight
                    elif s.duration is not None:
                        volume += s.duration * 0.1

            if volume == 0 and session.duration:
                volume = float(session.duration * 10)

            days[day_key]['count'] += 1
            days[day_key]['volume'] += volume
            days[day_key]['sessions'].append({
                'id': session.pk,
                'workout_name': session.workout.name if session.workout else 'Свободная тренировка',
                'workout_type': session.workout.type if session.workout else '',
                'duration': session.duration,
                'exercises_count': exercises_count,
            })

        return Response(sorted(days.values(), key=lambda d: d['date']))
