from datetime import date

from django.utils.timezone import localdate, localtime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import WorkoutSession, WorkoutSessionExercise, Set as WorkoutSet
from .serializers import WorkoutSessionSerializer


class ActivityTodayView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from nutrition.models import FoodEntry
        from progress.models import BodyMeasurement
        from users.models import Profile

        today = localdate()

        # ── Тренировки ────────────────────────────────────────────────────────
        sessions = (
            WorkoutSession.objects
            .filter(user=request.user, created_at__date=today)
            .prefetch_related('exercises__exercise__muscle_groups', 'exercises__sets')
            .order_by('created_at')
        )

        sessions_data = []
        total_duration = 0
        total_sets = 0
        total_reps = 0
        total_tonnage = 0.0
        unique_exercises = set()

        for session in sessions:
            if session.duration:
                total_duration += session.duration

            exercises_out = []
            for se in session.exercises.all():
                sets_list = list(se.sets.all())
                total_sets += len(sets_list)
                unique_exercises.add(se.exercise.pk)
                best_set = None
                for s in sets_list:
                    total_reps += s.reps
                    if s.weight:
                        total_tonnage += s.weight * s.reps
                    w = s.weight or 0
                    if best_set is None or w * s.reps > (best_set['weight'] or 0) * best_set['reps']:
                        best_set = {'reps': s.reps, 'weight': s.weight}
                exercises_out.append({
                    'name': se.exercise.name,
                    'total_sets': len(sets_list),
                    'best_set': best_set,
                    'muscle_groups': [mg.name for mg in se.exercise.muscle_groups.all()],
                })

            sessions_data.append({
                'id': session.pk,
                'duration': session.duration,
                'exercises': exercises_out,
            })

        # ── Серия дней подряд ─────────────────────────────────────────────────
        streak = 0
        check = today
        while WorkoutSession.objects.filter(user=request.user, created_at__date=check).exists():
            streak += 1
            check = date.fromordinal(check.toordinal() - 1)

        # ── Питание ───────────────────────────────────────────────────────────
        food_entries = list(
            FoodEntry.objects.filter(user=request.user, created_at__date=today).order_by('created_at')
        )

        nutrition_totals = {'calories': 0.0, 'protein': 0.0, 'fats': 0.0, 'carbs': 0.0}
        entries_by_meal: dict[str, list] = {'breakfast': [], 'lunch': [], 'dinner': [], 'snack': []}

        for entry in food_entries:
            nutrition_totals['calories'] += entry.calories
            nutrition_totals['protein'] += entry.protein
            nutrition_totals['fats'] += entry.fats
            nutrition_totals['carbs'] += entry.carbs
            bucket = entry.meal_type if entry.meal_type in entries_by_meal else 'snack'
            entries_by_meal[bucket].append({
                'id': entry.pk,
                'food_name': entry.food_name,
                'grams': entry.grams,
                'calories': round(entry.calories, 1),
                'protein': round(entry.protein, 1),
                'fats': round(entry.fats, 1),
                'carbs': round(entry.carbs, 1),
            })

        nutrition_totals = {k: round(v, 1) for k, v in nutrition_totals.items()}

        goals = None
        try:
            profile = Profile.objects.get(user=request.user)
            if any([profile.calorie_goal, profile.protein_goal, profile.fat_goal, profile.carbs_goal]):
                goals = {
                    'calories': profile.calorie_goal,
                    'protein': profile.protein_goal,
                    'fats': profile.fat_goal,
                    'carbs': profile.carbs_goal,
                }
        except Exception:
            pass

        # ── Замеры сегодня ────────────────────────────────────────────────────
        meas = (
            BodyMeasurement.objects
            .filter(user=request.user, created_at__date=today)
            .order_by('-created_at')
            .first()
        )
        measurement_data = None
        if meas:
            measurement_data = {
                'weight': meas.weight,
                'chest': meas.chest,
                'waist': meas.waist,
                'hips': meas.hips,
            }

        return Response({
            'date': today.isoformat(),
            'streak': streak,
            'workouts': {
                'sessions': sessions_data,
                'summary': {
                    'sessions_count': len(sessions_data),
                    'total_duration': total_duration,
                    'total_exercises': len(unique_exercises),
                    'total_sets': total_sets,
                    'total_reps': total_reps,
                    'total_tonnage': round(total_tonnage, 1),
                },
            },
            'nutrition': {
                'totals': nutrition_totals,
                'goals': goals,
                'entries_by_meal': entries_by_meal,
                'has_entries': bool(food_entries),
            },
            'measurement': measurement_data,
        })


class WorkoutSessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = (
            WorkoutSession.objects
            .filter(user=request.user)
            .prefetch_related('exercises__exercise', 'exercises__sets')
            .order_by('-created_at')
        )
        serializer = WorkoutSessionSerializer(sessions, many=True)
        return Response(serializer.data)


class WorkoutHeatmapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            year = int(request.query_params.get('year', localdate().year))
        except (ValueError, TypeError):
            year = localdate().year

        year_start = date(year, 1, 1)
        year_end = date(year, 12, 31)

        sessions = (
            WorkoutSession.objects
            .filter(
                user=request.user,
                created_at__date__gte=year_start,
                created_at__date__lte=year_end,
            )
            .prefetch_related('exercises__sets', 'exercises__exercise')
            .order_by('created_at')
        )

        days: dict[str, dict] = {}

        for session in sessions:
            day_key = localtime(session.created_at).date().isoformat()

            if day_key not in days:
                days[day_key] = {
                    'date': day_key,
                    'count': 0,
                    'volume': 0,
                    'sessions': [],
                }

            session_exercises = session.exercises.all()
            exercises_count = session_exercises.count()

            volume = 0.0
            for se in session_exercises:
                for s in se.sets.all():
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
                'duration': session.duration,
                'exercises_count': exercises_count,
            })

        return Response(sorted(days.values(), key=lambda d: d['date']))


class WorkoutDayDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_param = request.query_params.get('date')
        if not date_param:
            return Response(
                {"detail": "Параметр 'date' обязателен."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sessions = (
            WorkoutSession.objects
            .filter(user=request.user, created_at__date=date_param)
            .prefetch_related(
                'exercises__exercise__muscle_groups',
                'exercises__sets',
            )
            .order_by('created_at')
        )

        if not sessions.exists():
            return Response(
                {"detail": "Нет тренировок за эту дату."},
                status=status.HTTP_404_NOT_FOUND,
            )

        total_duration = 0
        exercises_data = []
        all_exercise_ids = set()
        muscle_load: dict[str, int] = {}

        for session in sessions:
            if session.duration:
                total_duration += session.duration

            for se in session.exercises.all():
                ex = se.exercise
                all_exercise_ids.add(ex.pk)
                sets_list = list(se.sets.all())

                sets_data = [{'reps': s.reps, 'weight': s.weight, 'duration': s.duration} for s in sets_list]

                best_set = None
                for s in sets_list:
                    w = s.weight or 0
                    if best_set is None or w * s.reps > (best_set['weight'] or 0) * best_set['reps']:
                        best_set = {'reps': s.reps, 'weight': s.weight}

                muscle_groups = [{'id': mg.id, 'name': mg.name} for mg in ex.muscle_groups.all()]
                for mg in ex.muscle_groups.all():
                    muscle_load[mg.name] = muscle_load.get(mg.name, 0) + len(sets_list)

                exercises_data.append({
                    'exercise': {
                        'id': ex.pk,
                        'name': ex.name,
                        'muscle_groups': muscle_groups,
                    },
                    'sets': sets_data,
                    'total_sets': len(sets_list),
                    'best_set': best_set,
                })

        total_sets = sum(e['total_sets'] for e in exercises_data)
        total_reps = sum(s['reps'] for e in exercises_data for s in e['sets'])
        total_tonnage = sum(
            (s['weight'] or 0) * s['reps']
            for e in exercises_data
            for s in e['sets']
        )

        # Progress: compare with previous session for each exercise
        progress = []
        for exercise_id in all_exercise_ids:
            from .models import Exercise
            ex = Exercise.objects.get(pk=exercise_id)

            prev_sets = (
                WorkoutSet.objects
                .filter(
                    session_exercise__exercise_id=exercise_id,
                    session_exercise__session__user=request.user,
                    session_exercise__session__created_at__date__lt=date_param,
                )
                .order_by('-session_exercise__session__created_at')
            )

            current_exercise_data = [e for e in exercises_data if e['exercise']['id'] == exercise_id]
            if not current_exercise_data:
                continue
            current_best = current_exercise_data[0]['best_set']
            if not current_best:
                continue

            prev_session_sets = []
            if prev_sets.exists():
                prev_session_date = prev_sets.first().session_exercise.session.created_at.date()
                prev_session_sets = list(
                    prev_sets.filter(
                        session_exercise__session__created_at__date=prev_session_date
                    )
                )

            if prev_session_sets:
                prev_best = max(
                    prev_session_sets,
                    key=lambda s: (s.weight or 0) * s.reps,
                )
                previous_best = {'reps': prev_best.reps, 'weight': prev_best.weight}
                delta_weight = (current_best['weight'] or 0) - (prev_best.weight or 0)
                delta_reps = current_best['reps'] - prev_best.reps
            else:
                previous_best = None
                delta_weight = 0
                delta_reps = 0

            progress.append({
                'exercise_name': ex.name,
                'current_best': current_best,
                'previous_best': previous_best,
                'delta_weight': delta_weight,
                'delta_reps': delta_reps,
            })

        # Records: check if current best is all-time best
        records = []
        for exercise_id in all_exercise_ids:
            from .models import Exercise
            ex = Exercise.objects.get(pk=exercise_id)

            all_time_best_set = (
                WorkoutSet.objects
                .filter(
                    session_exercise__exercise_id=exercise_id,
                    session_exercise__session__user=request.user,
                    session_exercise__session__created_at__date__lt=date_param,
                )
                .order_by()
            )

            current_exercise_data = [e for e in exercises_data if e['exercise']['id'] == exercise_id]
            if not current_exercise_data:
                continue
            current_best = current_exercise_data[0]['best_set']
            if not current_best:
                continue

            current_score = (current_best['weight'] or 0) * current_best['reps']

            is_record = True
            for s in all_time_best_set:
                if (s.weight or 0) * s.reps >= current_score:
                    is_record = False
                    break

            if is_record and current_score > 0:
                records.append({
                    'exercise_name': ex.name,
                    'type': 'weight' if current_best['weight'] else 'reps',
                    'value': current_best['weight'] or current_best['reps'],
                    'reps': current_best['reps'],
                })

        muscle_load_list = sorted(
            [{'muscle': k, 'sets_count': v} for k, v in muscle_load.items()],
            key=lambda x: x['sets_count'],
            reverse=True,
        )

        return Response({
            'date': date_param,
            'summary': {
                'duration': total_duration,
                'exercises_count': len(exercises_data),
                'total_sets': total_sets,
                'total_reps': total_reps,
                'total_tonnage': round(total_tonnage, 1),
            },
            'exercises': exercises_data,
            'progress': progress,
            'muscle_load': muscle_load_list,
            'records': records,
        })
