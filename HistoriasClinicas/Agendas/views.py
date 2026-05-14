"""
Vistas REST para el módulo de Agendas.
Controladores que exponen JSON y delegan lógica a services.py.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Cita, Servicio, Derivacion, Certificado
from .serializers import (
    CitaSerializer, ServicioSerializer, ConsultaMedicaSerializer,
    ConsultaOdontologicaSerializer, ConsultaPsicologicaSerializer,
    ConsultaSocialSerializer, DerivacionSerializer, CertificadoSerializer
)
from . import services


class BaseAgendasViewSet(viewsets.ModelViewSet):
    """ViewSet base con autenticación JWT común a todos los endpoints."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]


class CitaViewSet(BaseAgendasViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer
    filterset_fields = ['paciente_id', 'profesional_id', 'estado']
    ordering_fields = ['fecha_hora', 'fecha_creacion']
    ordering = ['-fecha_hora']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            services.validar_choque_citas(
                profesional_id=serializer.validated_data['profesional_id'],
                fecha_hora=serializer.validated_data['fecha_hora']
            )

            if 'servicios' in serializer.validated_data:
                servicios = services.validar_servicios_cita(
                    serializer.validated_data['servicios']
                )
                serializer.validated_data['servicios'] = servicios

            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except services.ConflictoHorarioError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_409_CONFLICT)
        except services.DatosInvalidosError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='historial')
    def historial(self, request, pk=None):
        cita = self.get_object()

        historial = {
            'cita': CitaSerializer(cita).data,
            'servicios': list(cita.servicios.values('id', 'nombre')),
            'consultas_asociadas': cita.contar_consultas(),
            'fecha_creacion': cita.fecha_creacion,
            'fecha_actualizacion': cita.fecha_actualizacion,
        }

        return Response(historial, status=status.HTTP_200_OK)


class ServicioViewSet(BaseAgendasViewSet):
    queryset = Servicio.objects.filter(es_activo=True)
    serializer_class = ServicioSerializer
    ordering_fields = ['nombre', 'fecha_creacion']
    ordering = ['nombre']


class AtencionViewSet(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def create(self, request):
        cita_id = request.data.get('cita_id')
        tipo_consulta = request.data.get('tipo_consulta')
        datos_consulta = request.data.get('datos_consulta', {})

        if not cita_id or not tipo_consulta:
            return Response(
                {'error': 'Debe proporcionar cita_id y tipo_consulta.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            consulta = services.registrar_atencion_integral(
                cita_id=cita_id,
                tipo_consulta=tipo_consulta,
                datos_consulta=datos_consulta,
            )

            serializer = {
                'medica': ConsultaMedicaSerializer,
                'odontologica': ConsultaOdontologicaSerializer,
                'psicologica': ConsultaPsicologicaSerializer,
                'social': ConsultaSocialSerializer,
            }.get(tipo_consulta.lower())

            if serializer is None:
                return Response(
                    {'error': f'Tipo de consulta inválido: {tipo_consulta}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            return Response(serializer(consulta).data, status=status.HTTP_201_CREATED)

        except services.EstadoCitaInvalidoError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_409_CONFLICT)
        except services.DatosInvalidosError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class DerivacionViewSet(BaseAgendasViewSet):
    queryset = Derivacion.objects.all()
    serializer_class = DerivacionSerializer
    filterset_fields = ['paciente_id', 'tipo', 'estado']
    ordering_fields = ['fecha_creacion', 'estado']
    ordering = ['-fecha_creacion']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            derivacion = services.gestionar_derivacion(
                paciente_id=serializer.validated_data['paciente_id'],
                remitente_id=serializer.validated_data['remitente_id'],
                destinatario=serializer.validated_data['destinatario'],
                tipo_derivacion=serializer.validated_data['tipo'],
                motivo=serializer.validated_data['motivo'],
            )
            return Response(DerivacionSerializer(derivacion).data, status=status.HTTP_201_CREATED)
        except services.DatosInvalidosError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class CertificadoViewSet(BaseAgendasViewSet):
    queryset = Certificado.objects.all()
    serializer_class = CertificadoSerializer
    filterset_fields = ['tipo']
    ordering_fields = ['fecha_emision']
    ordering = ['-fecha_emision']

