from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import BodyMeasurement
from .serializers import BodyMeasurementSerializer


class MeasurementListView(APIView):
    """Список замеров тела текущего пользователя."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        measurements = (
            BodyMeasurement.objects
            .filter(user=request.user)
            .order_by('-created_at')
        )
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
