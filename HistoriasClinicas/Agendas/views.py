"""
Vistas REST para el módulo de Agendas.
Controladores que exponen JSON y delegan lógica a services.py.
"""
import logging

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Cita, Servicio, Derivacion, Certificado
from .serializers import (
    CitaSerializer, ServicioSerializer, ConsultaMedicaSerializer,
    ConsultaOdontologicaSerializer, ConsultaPsicologicaSerializer,
    ConsultaSocialSerializer, DerivacionSerializer, CertificadoSerializer,
)
from . import services
from .pdf_utils import generar_pdf_certificado
from Notificaciones.services import generate_notification_for_event
from Notificaciones.email_service import enviar_certificado_por_email
from Seguridad.models import Cuenta, Usuario

logger = logging.getLogger(__name__)


class BaseAgendasViewSet(viewsets.ModelViewSet):
    """ViewSet base con autenticación JWT común a todos los endpoints."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]


class CitaViewSet(BaseAgendasViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer
    ordering_fields = ['fecha_hora', 'fecha_creacion']
    ordering = ['-fecha_hora']

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        usuario_id = params.get('usuario_id')
        if usuario_id:
            qs = qs.filter(usuario_id=usuario_id)

        profesional_id = params.get('profesional_id')
        if profesional_id:
            qs = qs.filter(profesional_id=profesional_id)

        estado = params.get('estado')
        if estado:
            estados = estado.split(',')
            qs = qs.filter(estado__in=estados)

        fecha_desde = params.get('fecha_desde')
        if fecha_desde:
            qs = qs.filter(fecha_hora__date__gte=fecha_desde)

        fecha_hasta = params.get('fecha_hasta')
        if fecha_hasta:
            qs = qs.filter(fecha_hora__date__lte=fecha_hasta)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            services.validar_choque_citas(
                profesional_id=serializer.validated_data.get('profesional_id'),
                fecha_hora=serializer.validated_data['fecha_hora'],
                usuario_id=serializer.validated_data.get('usuario_id'),
                duracion_minutos=30,
            )

            if not services.validar_anticipacion_minima(serializer.validated_data['fecha_hora']):
                raise services.DatosInvalidosError(
                    'El horario seleccionado ya no está disponible o no cumple con el tiempo mínimo de anticipación de 24 horas.'
                )

            if 'servicios' in serializer.validated_data:
                servicios = services.validar_servicios_cita(
                    serializer.validated_data['servicios']
                )
                serializer.validated_data['servicios'] = servicios
                services.validar_misma_especialidad_mismo_dia(
                    usuario_id=serializer.validated_data.get('usuario_id'),
                    fecha_hora=serializer.validated_data['fecha_hora'],
                    servicios_ids=serializer.validated_data['servicios'],
                )

            self.perform_create(serializer)
            cita = serializer.instance
            try:
                generate_notification_for_event(
                    event_type='creacion',
                    destinatario=cita.usuario_id,
                    cita=cita,
                    detalles={'mensaje': f'Su cita ha sido agendada para {cita.fecha_hora.strftime("%d/%m/%Y a las %H:%M")}.'},
                )
                if cita.profesional_id:
                    generate_notification_for_event(
                        event_type='creacion',
                        destinatario=cita.profesional_id,
                        cita=cita,
                        detalles={'mensaje': f'Nueva cita agendada - {cita.motivo or "Sin motivo"}.'},
                    )
            except Exception as exc:
                logger.exception('Error al crear notificación para cita %s: %s', cita.id, exc)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except services.ConflictoHorarioError as exc:
            return Response({
                'success': False,
                'error': {'code': 'CONFLICT', 'message': str(exc)},
            }, status=status.HTTP_409_CONFLICT)
        except services.DatosInvalidosError as exc:
            return Response({
                'success': False,
                'error': {'code': exc.code, 'message': str(exc)},
            }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except services.DatosInvalidosError as exc:
            return Response({
                'success': False,
                'error': {'code': exc.code, 'message': str(exc)},
            }, status=status.HTTP_400_BAD_REQUEST)

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_estado = old_instance.estado

        if (serializer.validated_data.get('estado') == 'CANCELADA'
                and old_estado != 'CANCELADA'):
            if not services.validar_anticipacion_minima(old_instance.fecha_hora):
                raise services.DatosInvalidosError(
                    'Solo se permiten cancelaciones con al menos 24 horas de anticipación.',
                    code='CANCELLATION_TIME_RESTRICTION'
                )

        instance = serializer.save()
        new_estado = instance.estado

        if new_estado != old_estado:
            try:
                if new_estado == 'CANCELADA':
                    generate_notification_for_event(
                        event_type='cancelacion',
                        destinatario=instance.usuario_id,
                        cita=instance,
                        detalles={'mensaje': f'Su cita del {instance.fecha_hora.strftime("%d/%m/%Y a las %H:%M")} ha sido cancelada.'},
                    )
                    if instance.profesional_id:
                        generate_notification_for_event(
                            event_type='cancelacion',
                            destinatario=instance.profesional_id,
                            cita=instance,
                            detalles={'mensaje': f'Cita cancelada por el paciente - {instance.motivo or "Sin motivo"}.'},
                        )
                elif new_estado == 'NO_ASISTIDA':
                    generate_notification_for_event(
                        event_type='cancelacion',
                        destinatario=instance.usuario_id,
                        cita=instance,
                        detalles={'mensaje': f'No asistió a su cita del {instance.fecha_hora.strftime("%d/%m/%Y a las %H:%M")}.'},
                    )
                elif new_estado == 'CONFIRMADA':
                    generate_notification_for_event(
                        event_type='confirmacion',
                        destinatario=instance.usuario_id,
                        cita=instance,
                        detalles={'mensaje': f'Su cita del {instance.fecha_hora.strftime("%d/%m/%Y a las %H:%M")} ha sido confirmada.'},
                    )
                elif new_estado == 'REAGENDADA':
                    generate_notification_for_event(
                        event_type='reagendamiento',
                        destinatario=instance.usuario_id,
                        cita=instance,
                        detalles={'mensaje': f'Su cita del {instance.fecha_hora.strftime("%d/%m/%Y a las %H:%M")} ha sido reagendada.'},
                    )
                    if instance.profesional_id:
                        generate_notification_for_event(
                            event_type='reagendamiento',
                            destinatario=instance.profesional_id,
                            cita=instance,
                            detalles={'mensaje': f'Cita reagendada - {instance.motivo or "Sin motivo"}.'},
                        )
            except Exception as exc:
                logger.exception('Error al crear notificación para cambio de estado de cita %s: %s', instance.id, exc)

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
    http_method_names = ['get', 'head', 'options']
    ordering_fields = ['nombre', 'fecha_creacion']
    ordering = ['nombre']


class AtencionViewSet(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    SERIALIZER_MAP = {
        'medica': ConsultaMedicaSerializer,
        'odontologica': ConsultaOdontologicaSerializer,
        'psicologica': ConsultaPsicologicaSerializer,
        'social': ConsultaSocialSerializer,
    }

    def _get_serializer(self, tipo_consulta):
        return self.SERIALIZER_MAP.get(tipo_consulta.lower())

    def _get_tipo_consulta(self, consulta):
        mapping = {
            'ConsultaMedica': 'medica',
            'ConsultaOdontologica': 'odontologica',
            'ConsultaPsicologica': 'psicologica',
            'ConsultaSocial': 'social',
        }
        return mapping.get(consulta.__class__.__name__)

    def list(self, request):
        cita_id = request.query_params.get('cita_id')
        if not cita_id:
            return Response(
                {'error': 'Debe proporcionar cita_id como parámetro de consulta.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        consulta = services.obtener_atencion_por_cita(cita_id=cita_id)
        if consulta is None:
            return Response({'data': None}, status=status.HTTP_200_OK)

        tipo = self._get_tipo_consulta(consulta)
        serializer_class = self._get_serializer(tipo)
        if serializer_class is None:
            return Response({'error': 'Tipo de consulta desconocido.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'data': serializer_class(consulta).data}, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        for tipo, modelo_cls in [('medica', ConsultaMedica), ('odontologica', ConsultaOdontologica),
                                  ('psicologica', ConsultaPsicologica), ('social', ConsultaSocial)]:
            try:
                consulta = modelo_cls.objects.get(id=pk)
                serializer = self._get_serializer(tipo)
                return Response(serializer(consulta).data, status=status.HTTP_200_OK)
            except modelo_cls.DoesNotExist:
                continue

        return Response({'error': 'Consulta no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

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

            serializer = self._get_serializer(tipo_consulta)

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

    def partial_update(self, request, pk=None):
        tipo_consulta = request.data.get('tipo_consulta')
        datos_consulta = request.data.get('datos_consulta', {})

        if not tipo_consulta:
            return Response(
                {'error': 'Debe proporcionar tipo_consulta.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            consulta = services.actualizar_atencion(
                consulta_id=pk,
                tipo_consulta=tipo_consulta,
                datos_consulta=datos_consulta,
            )

            serializer = self._get_serializer(tipo_consulta)
            return Response(serializer(consulta).data, status=status.HTTP_200_OK)

        except services.DatosInvalidosError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class DerivacionViewSet(BaseAgendasViewSet):
    queryset = Derivacion.objects.all()
    serializer_class = DerivacionSerializer
    filterset_fields = ['usuario_id', 'tipo', 'estado']
    ordering_fields = ['fecha_creacion', 'estado']
    ordering = ['-fecha_creacion']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            result = services.gestionar_derivacion(
                usuario_id=serializer.validated_data['usuario_id'],
                remitente_id=serializer.validated_data['remitente_id'],
                destinatario=serializer.validated_data['destinatario'],
                tipo_derivacion=serializer.validated_data['tipo'],
                motivo=serializer.validated_data['motivo'],
            )

            if isinstance(result, tuple):
                derivacion, cita = result
                try:
                    generate_notification_for_event(
                        event_type='derivacion',
                        destinatario=derivacion.usuario_id,
                        cita=cita,
                        detalles={'mensaje': f'Se ha creado una derivación: {derivacion.motivo}.'},
                    )
                    generate_notification_for_event(
                        event_type='creacion',
                        destinatario=cita.usuario_id,
                        cita=cita,
                        detalles={'mensaje': f'Como parte de la derivación, se ha agendado una cita para {cita.fecha_hora.strftime("%d/%m/%Y a las %H:%M")}.'},
                    )
                    if cita.profesional_id:
                        generate_notification_for_event(
                            event_type='creacion',
                            destinatario=cita.profesional_id,
                            cita=cita,
                            detalles={'mensaje': f'Nueva cita agendada por derivación - {cita.motivo or "Sin motivo"}.'},
                        )
                except Exception as exc:
                    logger.exception('Error al crear notificaciones para derivación interna: %s', exc)
                from .serializers import CitaSerializer
                return Response({
                    'derivacion': DerivacionSerializer(derivacion).data,
                    'cita_agendada': CitaSerializer(cita).data,
                }, status=status.HTTP_201_CREATED)
            else:
                try:
                    generate_notification_for_event(
                        event_type='derivacion',
                        destinatario=result.usuario_id,
                        detalles={'mensaje': f'Se ha creado una derivación externa: {result.motivo}.'},
                    )
                except Exception as exc:
                    logger.exception('Error al crear notificación para derivación externa: %s', exc)
                return Response({
                    'derivacion': DerivacionSerializer(result).data,
                    'cita_agendada': None,
                }, status=status.HTTP_201_CREATED)
        except services.DatosInvalidosError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class CertificadoViewSet(BaseAgendasViewSet):
    queryset = Certificado.objects.all()
    serializer_class = CertificadoSerializer
    filterset_fields = ['tipo']
    ordering_fields = ['fecha_emision']
    ordering = ['-fecha_emision']

    @action(detail=False, methods=['post'], url_path='enviar-correo')
    def enviar_correo(self, request):
        cita_id = request.data.get('cita_id')

        if not cita_id:
            return Response({'error': 'cita_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cita = Cita.objects.get(id=cita_id)
        except Cita.DoesNotExist:
            return Response({'error': 'Cita no encontrada'}, status=status.HTTP_404_NOT_FOUND)

        try:
            paciente_cuenta = Cuenta.objects.get(id=cita.usuario_id)
        except Cuenta.DoesNotExist:
            return Response({'error': 'Paciente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        destinatario_email = getattr(paciente_cuenta, 'correo', None) or paciente_cuenta.email
        if not destinatario_email:
            return Response({'error': 'El paciente no tiene correo registrado'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            paciente_perfil = Usuario.objects.get(cuenta=paciente_cuenta)
            paciente_nombre = f'{paciente_perfil.nombres} {paciente_perfil.apellidos}'
            paciente_cedula = paciente_perfil.cedula
        except Usuario.DoesNotExist:
            paciente_nombre = 'Paciente'
            paciente_cedula = ''

        profesional_nombre = ''
        profesional_cedula = ''
        if cita.profesional_id:
            try:
                prof_cuenta = Cuenta.objects.get(id=cita.profesional_id)
                prof_perfil = Usuario.objects.get(cuenta=prof_cuenta)
                profesional_nombre = f'{prof_perfil.nombres} {prof_perfil.apellidos}'
                profesional_cedula = prof_perfil.cedula
            except (Cuenta.DoesNotExist, Usuario.DoesNotExist):
                pass

        especialidad = ''
        servicios = cita.servicios.all()
        if servicios:
            especialidad = servicios[0].nombre

        observaciones = ''
        CONSULTA_MODELS = [
            cita.consultamedica_consultas,
            cita.consultaodontologica_consultas,
            cita.consultapsicologica_consultas,
            cita.consultasocial_consultas,
        ]
        for qs in CONSULTA_MODELS:
            consulta = qs.first()
            if consulta and consulta.observaciones:
                observaciones = consulta.observaciones
                break

        pdf_buffer = generar_pdf_certificado(
            cita=cita,
            paciente_nombre=paciente_nombre,
            paciente_cedula=paciente_cedula,
            profesional_nombre=profesional_nombre,
            profesional_cedula=profesional_cedula,
            especialidad=especialidad,
            observaciones=observaciones,
        )

        cert, _ = Certificado.objects.get_or_create(
            cita=cita,
            tipo='Asistencia',
        )

        enviado = enviar_certificado_por_email(
            cert, pdf_buffer, destinatario_email, paciente_nombre=paciente_nombre,
        )

        if enviado:
            return Response({'success': True, 'message': 'Certificado enviado por correo exitosamente'})
        else:
            return Response({'error': 'No se pudo enviar el certificado. Verifique la configuración de correo.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

