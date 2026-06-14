from datetime import date

from django.utils.timezone import localdate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import FoodEntry
from .serializers import FoodEntrySerializer, FoodEntryCreateSerializer


class FoodEntryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = FoodEntry.objects.filter(user=request.user).order_by('-created_at')

        date_param = request.query_params.get('date')
        if date_param:
            qs = qs.filter(created_at__date=date_param)

        serializer = FoodEntrySerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FoodEntryCreateSerializer(data=request.data)
        if serializer.is_valid():
            entry = serializer.save(user=request.user)
            return Response(
                FoodEntrySerializer(entry).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FoodEntryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_entry(self, pk, user):
        try:
            return FoodEntry.objects.get(pk=pk, user=user)
        except FoodEntry.DoesNotExist:
            return None

    def delete(self, request, pk):
        entry = self._get_entry(pk, request.user)
        if not entry:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class NutritionHeatmapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            year = int(request.query_params.get('year', localdate().year))
        except (ValueError, TypeError):
            year = localdate().year

        year_start = date(year, 1, 1)
        year_end = date(year, 12, 31)

        entries = FoodEntry.objects.filter(
            user=request.user,
            created_at__date__gte=year_start,
            created_at__date__lte=year_end,
        ).values('created_at__date', 'calories', 'protein', 'fats', 'carbs')

        day_map: dict[str, dict] = {}
        for row in entries:
            d = str(row['created_at__date'])
            if d not in day_map:
                day_map[d] = {
                    'count': 0,
                    'calories': 0.0,
                    'protein': 0.0,
                    'fats': 0.0,
                    'carbs': 0.0,
                }
            day_map[d]['count'] += 1
            day_map[d]['calories'] += row['calories'] or 0.0
            day_map[d]['protein'] += row['protein'] or 0.0
            day_map[d]['fats'] += row['fats'] or 0.0
            day_map[d]['carbs'] += row['carbs'] or 0.0

        result = [
            {
                'date': d,
                'count': v['count'],
                'calories': round(v['calories'], 1),
                'protein': round(v['protein'], 1),
                'fats': round(v['fats'], 1),
                'carbs': round(v['carbs'], 1),
            }
            for d, v in sorted(day_map.items())
        ]

        return Response(result)


class NutritionDayDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_param = request.query_params.get('date')
        if not date_param:
            return Response(
                {"detail": "Параметр 'date' обязателен."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        entries = FoodEntry.objects.filter(
            user=request.user,
            created_at__date=date_param,
        ).order_by('created_at')

        if not entries.exists():
            return Response(
                {"detail": "Нет записей питания за эту дату."},
                status=status.HTTP_404_NOT_FOUND,
            )

        totals = {
            'calories': 0.0,
            'protein': 0.0,
            'fats': 0.0,
            'carbs': 0.0,
        }

        entries_data = []
        for entry in entries:
            totals['calories'] += entry.calories
            totals['protein'] += entry.protein
            totals['fats'] += entry.fats
            totals['carbs'] += entry.carbs
            entries_data.append({
                'id': entry.pk,
                'food_name': entry.food_name,
                'grams': entry.grams,
                'calories': round(entry.calories, 1),
                'protein': round(entry.protein, 1),
                'fats': round(entry.fats, 1),
                'carbs': round(entry.carbs, 1),
                'meal_type': entry.meal_type,
                'logged_at': entry.created_at.isoformat(),
            })

        totals = {k: round(v, 1) for k, v in totals.items()}

        # Goals from profile
        goals = None
        try:
            from users.models import Profile
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

        return Response({
            'date': date_param,
            'totals': totals,
            'goals': goals,
            'entries': entries_data,
        })
