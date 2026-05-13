from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from ..models import FoodEntry
from ..serializers.nutrition_serializers import FoodEntrySerializer, FoodEntryCreateSerializer


class FoodEntryListView(APIView):
    """Дневник питания текущего пользователя. Поддерживает фильтрацию по дате."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = FoodEntry.objects.filter(user=request.user).order_by('-created_at')

        date = request.query_params.get('date')  # формат YYYY-MM-DD
        if date:
            qs = qs.filter(created_at__date=date)

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
