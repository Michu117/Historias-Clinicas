import logging

from django.core.exceptions import ValidationError as DjangoValidationError
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions, status

logger = logging.getLogger(__name__)
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from Agendas.models import (
    ConsultaMedica,
    ConsultaOdontologica,
    ConsultaPsicologica,
    ConsultaSocial,
)
from .models import Antecedente, Caso, Documento, HistoriaClinica, RegistroClinicoHistoria
from .serializers import (
    AntecedenteSerializer,
    CasoClinicoSerializer,
    CasoSerializer,
    DocumentoSerializer,
    HistoriaClinicaSerializer,
    RegistroClinicoHistoriaSerializer,
)
from Notificaciones.services import generate_notification_for_event

from .services import (
    actualizar_historia_clinica,
    crear_historia_clinica,
    es_administrador,
    es_medico,
    es_paciente,
    es_trabajador_social,
    listar_casos_clinicos,
    normalizar_rol,
    obtener_historia_por_id,
    obtener_historias_clinicas,
)


class BaseHistoriasView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def ok(self, data, message="Operation completed successfully"):
        return Response(
            {
                "success": True,
                "message": message,
                "data": data,
            },
            status=status.HTTP_200_OK,
        )

    def ok_list(self, data, message="Records retrieved successfully"):
        return Response(
            {
                "success": True,
                "message": message,
                "count": len(data),
                "data": data,
            },
            status=status.HTTP_200_OK,
        )

    def created(self, data, message="Operation completed successfully"):
        return Response(
            {
                "success": True,
                "message": message,
                "data": data,
            },
            status=status.HTTP_201_CREATED,
        )

    def validation_error(self, errors):
        return Response(
            {
                "success": False,
                "message": "Validation error",
                "errors": errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def not_found(self):
        return Response(
            {
                "success": False,
                "message": "Resource not found",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    def _denied(self, message="No tienes permisos para acceder a historias clínicas."):
        return Response(
            {"success": False, "message": message},
            status=status.HTTP_403_FORBIDDEN,
        )

    def _error_detail(self, exc):
        return getattr(exc, "detail", None) or getattr(exc, "message_dict", None) or {
            "non_field_errors": [str(exc)]
        }

    def _es_medico(self, request):
        return es_medico(request.user)

    def _es_paciente(self, request):
        return es_paciente(request.user)

    def _es_admin(self, request):
        return es_administrador(request.user)

    def _es_trabajador_social(self, request):
        return es_trabajador_social(request.user)


class HistoriaClinicaListCreateView(BaseHistoriasView):
    def get(self, request):
        if self._es_admin(request):
            return self._denied()
        if self._es_medico(request) or self._es_trabajador_social(request):
            historias = obtener_historias_clinicas()
            return self.ok_list(HistoriaClinicaSerializer(historias, many=True).data)
        historias = HistoriaClinica.objects.filter(
            usuario__cuenta=request.user
        )
        return self.ok_list(HistoriaClinicaSerializer(historias, many=True).data)

    @extend_schema(
        request=HistoriaClinicaSerializer,
        responses=HistoriaClinicaSerializer,
    )
    def post(self, request):
        return self._denied(
            "La creación de historias clínicas no está disponible desde este módulo."
        )


@extend_schema_view(
    patch=extend_schema(
        request=HistoriaClinicaSerializer,
        responses=HistoriaClinicaSerializer,
    ),
)
class HistoriaClinicaDetailView(BaseHistoriasView):
    def get(self, request, pk):
        if self._es_admin(request):
            return self._denied()
        try:
            if self._es_medico(request) or self._es_trabajador_social(request):
                historia = obtener_historia_por_id(pk)
            else:
                historia = obtener_historia_por_id(pk, usuario=request.user.perfil)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        return self.ok(HistoriaClinicaSerializer(historia).data)

    @extend_schema(
        request=HistoriaClinicaSerializer,
        responses=HistoriaClinicaSerializer,
    )
    def put(self, request, pk):
        if not self._es_medico(request):
            return self._denied("No tienes permisos para editar historias clínicas.")
        try:
            historia = obtener_historia_por_id(pk)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        serializer = HistoriaClinicaSerializer(historia, data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        try:
            historia = actualizar_historia_clinica(
                pk,
                serializer.validated_data,
                usuario=None,
            )
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        try:
            generate_notification_for_event(
                event_type='actualizacion_historia',
                destinatario=historia.usuario.cuenta,
                detalles={'mensaje': 'Su historia clínica ha sido actualizada.'},
            )
        except Exception as exc:
            logger.exception('Error al crear notificación para historia clínica %s: %s', pk, exc)
        return self.ok(HistoriaClinicaSerializer(historia).data)

    @extend_schema(
        request=HistoriaClinicaSerializer,
        responses=HistoriaClinicaSerializer,
    )
    def patch(self, request, pk):
        if not self._es_medico(request):
            return self._denied("No tienes permisos para editar historias clínicas.")
        try:
            historia = obtener_historia_por_id(pk)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        serializer = HistoriaClinicaSerializer(historia, data=request.data, partial=True)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        try:
            historia = actualizar_historia_clinica(
                pk,
                serializer.validated_data,
                usuario=None,
            )
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        try:
            generate_notification_for_event(
                event_type='actualizacion_historia',
                destinatario=historia.usuario.cuenta,
                detalles={'mensaje': 'Su historia clínica ha sido actualizada.'},
            )
        except Exception as exc:
            logger.exception('Error al crear notificación para historia clínica %s: %s', pk, exc)
        return self.ok(HistoriaClinicaSerializer(historia).data)

    def delete(self, request, pk):
        return self._denied(
            "No se permite eliminar historias clínicas."
        )


class CasoListCreateView(BaseHistoriasView):
    def get(self, request):
        if self._es_medico(request) or self._es_trabajador_social(request):
            casos = Caso.objects.select_related("historia_clinica").all()
        else:
            casos = Caso.objects.select_related("historia_clinica").filter(
                historia_clinica__usuario__cuenta=request.user
            )
        return self.ok_list(CasoSerializer(casos, many=True).data)

    @extend_schema(
        request=CasoSerializer,
        responses=CasoSerializer,
    )
    def post(self, request):
        if not self._es_medico(request):
            return self._denied("No tienes permisos para crear casos clínicos.")
        serializer = CasoSerializer(data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        historia_clinica_id = request.data.get("historia_clinica")
        if not historia_clinica_id:
            return self.validation_error(
                {"historia_clinica": ["Debes especificar la historia clínica asociada."]}
            )
        try:
            historia = HistoriaClinica.objects.get(pk=historia_clinica_id)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        try:
            caso = serializer.save(historia_clinica=historia)
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        try:
            generate_notification_for_event(
                event_type='actualizacion_historia',
                destinatario=historia.usuario.cuenta,
                detalles={'mensaje': f'Se ha abierto un nuevo caso en su historia clínica con prioridad {caso.get_prioridad_display()}.'},
            )
        except Exception as exc:
            logger.exception('Error al crear notificación para nuevo caso: %s', exc)
        return self.created(CasoSerializer(caso).data)


class CasoDetailView(BaseHistoriasView):
    def _get_caso(self, pk, request):
        if self._es_medico(request):
            return Caso.objects.select_related("historia_clinica").get(pk=pk)
        return Caso.objects.select_related("historia_clinica").get(
            pk=pk,
            historia_clinica__usuario__cuenta=request.user,
        )

    def get(self, request, pk):
        if self._es_admin(request):
            return self._denied()
        try:
            caso = self._get_caso(pk, request)
        except Caso.DoesNotExist:
            return self.not_found()
        return self.ok(CasoSerializer(caso).data)

    @extend_schema(
        request=CasoSerializer,
        responses=CasoSerializer,
    )
    def put(self, request, pk):
        if not self._es_medico(request):
            return self._denied("No tienes permisos para editar casos clínicos.")
        try:
            caso = Caso.objects.select_related("historia_clinica").get(pk=pk)
        except Caso.DoesNotExist:
            return self.not_found()
        serializer = CasoSerializer(caso, data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        try:
            caso = serializer.save()
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        try:
            generate_notification_for_event(
                event_type='actualizacion_historia',
                destinatario=caso.historia_clinica.usuario.cuenta,
                detalles={'mensaje': f'Se ha actualizado un caso en su historia clínica. Estado: {caso.get_estado_caso_display()}.'},
            )
        except Exception as exc:
            logger.exception('Error al crear notificación para actualización de caso %s: %s', pk, exc)
        return self.ok(CasoSerializer(caso).data)

    @extend_schema(
        request=CasoSerializer,
        responses=CasoSerializer,
    )
    def patch(self, request, pk):
        if not self._es_medico(request):
            return self._denied("No tienes permisos para editar casos clínicos.")
        try:
            caso = Caso.objects.select_related("historia_clinica").get(pk=pk)
        except Caso.DoesNotExist:
            return self.not_found()
        serializer = CasoSerializer(caso, data=request.data, partial=True)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        try:
            caso = serializer.save()
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        try:
            generate_notification_for_event(
                event_type='actualizacion_historia',
                destinatario=caso.historia_clinica.usuario.cuenta,
                detalles={'mensaje': f'Se ha actualizado un caso en su historia clínica. Estado: {caso.get_estado_caso_display()}.'},
            )
        except Exception as exc:
            logger.exception('Error al crear notificación para actualización de caso %s: %s', pk, exc)
        return self.ok(CasoSerializer(caso).data)

    def delete(self, request, pk):
        return self._denied(
            "No se permite eliminar casos clínicos. Para cerrar un caso, actualiza su estado a CERRADO."
        )


class AntecedenteListCreateView(BaseHistoriasView):
    def get(self, request):
        if self._es_medico(request) or self._es_trabajador_social(request):
            antecedentes = Antecedente.objects.select_related("historia_clinica").all()
        else:
            antecedentes = Antecedente.objects.select_related("historia_clinica").filter(
                historia_clinica__usuario__cuenta=request.user
            )
        return self.ok_list(AntecedenteSerializer(antecedentes, many=True).data)

    @extend_schema(
        request=AntecedenteSerializer,
        responses=AntecedenteSerializer,
    )
    def post(self, request):
        if not self._es_medico(request):
            return self._denied("No tienes permisos para crear antecedentes.")
        serializer = AntecedenteSerializer(data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        historia_clinica_id = request.data.get("historia_clinica")
        if not historia_clinica_id:
            return self.validation_error(
                {"historia_clinica": ["Debes especificar la historia clínica asociada."]}
            )
        try:
            historia = HistoriaClinica.objects.get(pk=historia_clinica_id)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        try:
            antecedente = serializer.save(historia_clinica=historia)
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        try:
            generate_notification_for_event(
                event_type='actualizacion_historia',
                destinatario=historia.usuario.cuenta,
                detalles={'mensaje': f'Se ha registrado un nuevo antecedente ({antecedente.get_tipo_antecedente_display()}) en su historia clínica.'},
            )
        except Exception as exc:
            logger.exception('Error al crear notificación para nuevo antecedente: %s', exc)
        return self.created(AntecedenteSerializer(antecedente).data)


class AntecedenteDetailView(BaseHistoriasView):
    def _get_antecedente(self, pk, request):
        if self._es_medico(request):
            return Antecedente.objects.select_related("historia_clinica").get(pk=pk)
        return Antecedente.objects.select_related("historia_clinica").get(
            pk=pk,
            historia_clinica__usuario__cuenta=request.user,
        )

    def get(self, request, pk):
        if self._es_admin(request):
            return self._denied()
        try:
            antecedente = self._get_antecedente(pk, request)
        except Antecedente.DoesNotExist:
            return self.not_found()
        return self.ok(AntecedenteSerializer(antecedente).data)

    @extend_schema(
        request=AntecedenteSerializer,
        responses=AntecedenteSerializer,
    )
    def put(self, request, pk):
        if not self._es_medico(request):
            return self._denied("No tienes permisos para editar antecedentes.")
        try:
            antecedente = Antecedente.objects.select_related("historia_clinica").get(pk=pk)
        except Antecedente.DoesNotExist:
            return self.not_found()
        serializer = AntecedenteSerializer(antecedente, data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        try:
            antecedente = serializer.save()
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        try:
            generate_notification_for_event(
                event_type='actualizacion_historia',
                destinatario=antecedente.historia_clinica.usuario.cuenta,
                detalles={'mensaje': 'Se ha actualizado un antecedente en su historia clínica.'},
            )
        except Exception as exc:
            logger.exception('Error al crear notificación para actualización de antecedente %s: %s', pk, exc)
        return self.ok(AntecedenteSerializer(antecedente).data)

    @extend_schema(
        request=AntecedenteSerializer,
        responses=AntecedenteSerializer,
    )
    def patch(self, request, pk):
        if not self._es_medico(request):
            return self._denied("No tienes permisos para editar antecedentes.")
        try:
            antecedente = Antecedente.objects.select_related("historia_clinica").get(pk=pk)
        except Antecedente.DoesNotExist:
            return self.not_found()
        serializer = AntecedenteSerializer(antecedente, data=request.data, partial=True)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        try:
            antecedente = serializer.save()
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        try:
            generate_notification_for_event(
                event_type='actualizacion_historia',
                destinatario=antecedente.historia_clinica.usuario.cuenta,
                detalles={'mensaje': 'Se ha actualizado un antecedente en su historia clínica.'},
            )
        except Exception as exc:
            logger.exception('Error al crear notificación para actualización de antecedente %s: %s', pk, exc)
        return self.ok(AntecedenteSerializer(antecedente).data)

    def delete(self, request, pk):
        if not self._es_medico(request):
            return self._denied("No tienes permisos para eliminar antecedentes.")
        try:
            antecedente = Antecedente.objects.get(pk=pk)
        except Antecedente.DoesNotExist:
            return self.not_found()
        antecedente.delete()
        return self.ok({})


class DocumentoListCreateView(BaseHistoriasView):
    def get(self, request):
        if self._es_medico(request) or self._es_trabajador_social(request):
            documentos = Documento.objects.select_related("historia_clinica").all()
        else:
            documentos = Documento.objects.select_related("historia_clinica").filter(
                historia_clinica__usuario__cuenta=request.user
            )
        return self.ok_list(DocumentoSerializer(documentos, many=True).data)

    @extend_schema(
        request=DocumentoSerializer,
        responses=DocumentoSerializer,
    )
    def post(self, request):
        if not self._es_medico(request) and not self._es_trabajador_social(request):
            return self._denied("No tienes permisos para crear documentos.")
        serializer = DocumentoSerializer(data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        historia_clinica_id = request.data.get("historia_clinica")
        if not historia_clinica_id:
            return self.validation_error(
                {"historia_clinica": ["Debes especificar la historia clínica asociada."]}
            )
        try:
            historia = HistoriaClinica.objects.get(pk=historia_clinica_id)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        try:
            documento = serializer.save(historia_clinica=historia)
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        try:
            generate_notification_for_event(
                event_type='actualizacion_historia',
                destinatario=historia.usuario.cuenta,
                detalles={'mensaje': f'Se ha añadido un nuevo documento ({documento.get_tipo_documento_display()}) a su historia clínica.'},
            )
        except Exception as exc:
            logger.exception('Error al crear notificación para nuevo documento: %s', exc)
        return self.created(DocumentoSerializer(documento).data)


@extend_schema_view(
    patch=extend_schema(
        request=DocumentoSerializer,
        responses=DocumentoSerializer,
    ),
)
class DocumentoDetailView(BaseHistoriasView):
    def _get_documento(self, pk, request):
        if self._es_medico(request) or self._es_trabajador_social(request):
            return Documento.objects.select_related("historia_clinica").get(pk=pk)
        return Documento.objects.select_related("historia_clinica").get(
            pk=pk,
            historia_clinica__usuario__cuenta=request.user,
        )

    def get(self, request, pk):
        if self._es_admin(request):
            return self._denied()
        try:
            documento = self._get_documento(pk, request)
        except Documento.DoesNotExist:
            return self.not_found()
        return self.ok(DocumentoSerializer(documento).data)

    @extend_schema(
        request=DocumentoSerializer,
        responses=DocumentoSerializer,
    )
    def put(self, request, pk):
        if not self._es_medico(request):
            return self._denied("No tienes permisos para editar documentos.")
        try:
            documento = Documento.objects.select_related("historia_clinica").get(pk=pk)
        except Documento.DoesNotExist:
            return self.not_found()
        serializer = DocumentoSerializer(documento, data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        try:
            documento = serializer.save()
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        try:
            generate_notification_for_event(
                event_type='actualizacion_historia',
                destinatario=documento.historia_clinica.usuario.cuenta,
                detalles={'mensaje': 'Se ha actualizado un documento en su historia clínica.'},
            )
        except Exception as exc:
            logger.exception('Error al crear notificación para actualización de documento %s: %s', pk, exc)
        return self.ok(DocumentoSerializer(documento).data)

    @extend_schema(
        request=DocumentoSerializer,
        responses=DocumentoSerializer,
    )
    def patch(self, request, pk):
        if not self._es_medico(request):
            return self._denied("No tienes permisos para editar documentos.")
        try:
            documento = Documento.objects.select_related("historia_clinica").get(pk=pk)
        except Documento.DoesNotExist:
            return self.not_found()
        serializer = DocumentoSerializer(documento, data=request.data, partial=True)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        try:
            documento = serializer.save()
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        try:
            generate_notification_for_event(
                event_type='actualizacion_historia',
                destinatario=documento.historia_clinica.usuario.cuenta,
                detalles={'mensaje': 'Se ha actualizado un documento en su historia clínica.'},
            )
        except Exception as exc:
            logger.exception('Error al crear notificación para actualización de documento %s: %s', pk, exc)
        return self.ok(DocumentoSerializer(documento).data)

    def delete(self, request, pk):
        if not self._es_medico(request):
            return self._denied("No tienes permisos para eliminar documentos.")
        try:
            documento = Documento.objects.get(pk=pk)
        except Documento.DoesNotExist:
            return self.not_found()
        documento.delete()
        return self.ok({})


class MiHistoriaClinicaView(BaseHistoriasView):
    def get(self, request):
        perfil = getattr(request.user, 'perfil', None)
        if not perfil:
            return self.not_found()

        try:
            historia = HistoriaClinica.objects.get(usuario=perfil)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()

        return self.ok(HistoriaClinicaSerializer(historia).data)


class RegistroClinicoHistoriaListCreateView(BaseHistoriasView):
    def get(self, request, historia_id):
        if self._es_paciente(request) or self._es_admin(request):
            try:
                historia = HistoriaClinica.objects.get(
                    pk=historia_id, usuario__cuenta=request.user
                )
            except HistoriaClinica.DoesNotExist:
                return self.not_found()
        elif self._es_medico(request) or self._es_trabajador_social(request):
            try:
                historia = HistoriaClinica.objects.get(pk=historia_id)
            except HistoriaClinica.DoesNotExist:
                return self.not_found()
        else:
            return self._denied("No tienes permisos para ver registros clínicos.")

        registros = RegistroClinicoHistoria.objects.filter(
            historia_clinica=historia, activo=True
        ).select_related("medico_registro")
        return self.ok_list(
            RegistroClinicoHistoriaSerializer(registros, many=True).data
        )

    @extend_schema(
        request=RegistroClinicoHistoriaSerializer,
        responses=RegistroClinicoHistoriaSerializer,
    )
    def post(self, request, historia_id):
        if not self._es_medico(request):
            return self._denied("No tienes permisos para crear registros clínicos.")
        try:
            historia = HistoriaClinica.objects.get(pk=historia_id)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        serializer = RegistroClinicoHistoriaSerializer(data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        try:
            medico = request.user.perfil if hasattr(request.user, 'perfil') else None
            registro = serializer.save(
                historia_clinica=historia,
                medico_registro=medico,
            )
        except Exception as exc:
            return self.validation_error({"detail": str(exc)})
        try:
            generate_notification_for_event(
                event_type='actualizacion_historia',
                destinatario=historia.usuario.cuenta,
                detalles={'mensaje': f'Se ha añadido un nuevo registro clínico ({registro.get_tipo_display()}) a su historia clínica.'},
            )
        except Exception as exc:
            logger.exception('Error al crear notificación para nuevo registro clínico: %s', exc)
        return self.created(RegistroClinicoHistoriaSerializer(registro).data)


TIPO_CONSULTA_MAP = {
    ConsultaMedica: "Consulta médica",
    ConsultaOdontologica: "Consulta odontológica",
    ConsultaPsicologica: "Consulta psicológica",
    ConsultaSocial: "Consulta social",
}


class HistoriaConsultasListView(BaseHistoriasView):
    def get(self, request, historia_id):
        if self._es_paciente(request) or self._es_admin(request):
            try:
                historia = HistoriaClinica.objects.get(
                    pk=historia_id, usuario__cuenta=request.user
                )
            except HistoriaClinica.DoesNotExist:
                return self.not_found()

        try:
            casos = listar_casos_clinicos(historia_id)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()

        return self.ok_list(CasoClinicoSerializer(casos, many=True).data)
