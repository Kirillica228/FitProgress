from datetime import timedelta

from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import BodyMeasurement
from .serializers import BodyMeasurementSerializer


class MeasurementListView(APIView):
    """Список замеров тела текущего пользователя.

    GET /api/measurements/?days=7   — только за последние 7 дней
    GET /api/measurements/?days=30  — за последние 30 дней
    GET /api/measurements/          — все замеры
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        measurements = BodyMeasurement.objects.filter(user=request.user)

        days_param = request.query_params.get('days')
        if days_param:
            try:
                cutoff = timezone.now() - timedelta(days=int(days_param))
                measurements = measurements.filter(created_at__gte=cutoff)
            except (ValueError, TypeError):
                pass

        measurements = measurements.order_by('created_at')
        serializer = BodyMeasurementSerializer(measurements, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BodyMeasurementSerializer(data=request.data)
        if serializer.is_valid():
            measurement = serializer.save(user=request.user)
            return Response(
                BodyMeasurementSerializer(measurement).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
