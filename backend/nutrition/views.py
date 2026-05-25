from datetime import date

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import FoodEntry
from .serializers import FoodEntrySerializer, FoodEntryCreateSerializer


class FoodEntryListView(APIView):
    """Дневник питания текущего пользователя. Поддерживает фильтрацию по дате."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = FoodEntry.objects.filter(user=request.user).order_by('-created_at')

        date_param = request.query_params.get('date')  # формат YYYY-MM-DD
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
    """
    Возвращает данные питания в формате heatmap за указанный год.

    GET /api/nutrition-heatmap/?year=2025
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            year = int(request.query_params.get('year', date.today().year))
        except (ValueError, TypeError):
            year = date.today().year

        year_start = date(year, 1, 1)
        year_end = date(year, 12, 31)

        entries = FoodEntry.objects.filter(
            user=request.user,
            created_at__date__gte=year_start,
            created_at__date__lte=year_end,
        ).values('created_at__date', 'calories')

        # Агрегируем по дате
        day_map: dict[str, dict] = {}
        for row in entries:
            d = str(row['created_at__date'])
            if d not in day_map:
                day_map[d] = {'count': 0, 'calories': 0.0}
            day_map[d]['count'] += 1
            day_map[d]['calories'] += row['calories'] or 0.0

        result = [
            {
                'date': d,
                'count': v['count'],
                'calories': round(v['calories'], 1),
            }
            for d, v in sorted(day_map.items())
        ]

        return Response(result)
