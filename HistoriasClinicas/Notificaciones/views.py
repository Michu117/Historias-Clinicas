from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .serializers import NotificacionSerializer


class NotificacionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        filtros = {
            'estado': request.query_params.get('estado'),
            'tipo': request.query_params.get('tipo'),
            'cita_id': request.query_params.get('cita'),
            'usuario_id': request.query_params.get('usuario'),
        }
        queryset = services.get_notifications_for_user(request.user, filtros)
        serializer = NotificacionSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = NotificacionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        notification = services.create_notification(serializer.validated_data, created_by=request.user)
        output = NotificacionSerializer(notification)
        return Response(output.data, status=status.HTTP_201_CREATED)


class NotificacionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        notification = services.get_notification_detail(request.user, pk)
        serializer = NotificacionSerializer(notification)
        return Response(serializer.data)


class NotificacionMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        notification = services.mark_notification_read(request.user, pk)
        serializer = NotificacionSerializer(notification)
        return Response(serializer.data)


class NotificacionMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        filtros = {
            'estado': request.query_params.get('estado'),
            'tipo': request.query_params.get('tipo'),
            'cita_id': request.query_params.get('cita'),
            'usuario_id': request.query_params.get('usuario'),
        }
        ids = request.data.get('ids') if isinstance(request.data, dict) else None
        contador = services.mark_notifications_read(request.user, filtros, ids=ids)
        return Response({'notificaciones_marcadas': contador})
