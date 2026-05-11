import logging

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Antecedente, Caso, Documento, HistoriaClinica
from .serializers import (
    AntecedenteSerializer,
    CasoSerializer,
    DocumentoSerializer,
    HistoriaClinicaSerializer,
)
from .services import (
    actualizar_caso,
    actualizar_historia_clinica,
    crear_antecedente,
    crear_caso,
    crear_documento,
    crear_historia_clinica,
    obtener_antecedente_por_historia,
    obtener_antecedentes_por_historia,
    obtener_caso_por_historia,
    obtener_casos_por_historia,
    obtener_documento_por_historia,
    obtener_documentos_por_historia,
    obtener_historia_por_id,
    obtener_historias_clinicas,
)

logger = logging.getLogger(__name__)


class BaseHistoriasAPIView(APIView):
    success_message = "Operación realizada correctamente"
    list_message = "Registros obtenidos correctamente"
    validation_message = "Error de validación"
    not_found_message = "Recurso no encontrado"
    server_error_message = "Error interno del servidor"

    def ok(self, data, status_code=status.HTTP_200_OK, message=None):
        return Response(
            {
                "success": True,
                "message": message or self.success_message,
                "data": data,
            },
            status=status_code,
        )

    def ok_list(self, data, message=None):
        return Response(
            {
                "success": True,
                "message": message or self.list_message,
                "count": len(data),
                "data": data,
            },
            status=status.HTTP_200_OK,
        )

    def validation_error(self, exc):
        detail = getattr(exc, "detail", None) or getattr(exc, "message_dict", None)
        if detail is None:
            detail = {"non_field_errors": [str(exc)]}
        return Response(
            {
                "success": False,
                "message": self.validation_message,
                "errors": detail,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def not_found(self):
        return Response(
            {
                "success": False,
                "message": self.not_found_message,
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    def server_error(self, log_message):
        logger.exception(log_message)
        return Response(
            {
                "success": False,
                "message": self.server_error_message,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    def validated_payload(self, serializer_class, data, instance=None, partial=False, context=None):
        serializer = serializer_class(
            instance=instance,
            data=data,
            partial=partial,
            context=context or {},
        )
        serializer.is_valid(raise_exception=True)
        return dict(serializer.validated_data)


class HistoriaClinicaListCreateAPIView(BaseHistoriasAPIView):
    def get(self, request):
        try:
            historias = obtener_historias_clinicas()
            serializer = HistoriaClinicaSerializer(historias, many=True)
            return self.ok_list(serializer.data)
        except Exception:
            return self.server_error("Error al listar historias clinicas")

    def post(self, request):
        try:
            payload = self.validated_payload(HistoriaClinicaSerializer, request.data)
            historia = crear_historia_clinica(payload)
            return self.ok(HistoriaClinicaSerializer(historia).data, status_code=status.HTTP_201_CREATED)
        except (DRFValidationError, DjangoValidationError) as exc:
            return self.validation_error(exc)
        except Exception:
            return self.server_error("Error al crear historia clinica")


class HistoriaClinicaDetailAPIView(BaseHistoriasAPIView):
    def get(self, request, id):
        try:
            historia = obtener_historia_por_id(id)
            return self.ok(HistoriaClinicaSerializer(historia).data)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        except Exception:
            return self.server_error("Error al obtener historia clinica")

    def put(self, request, id):
        try:
            payload = self.validated_payload(HistoriaClinicaSerializer, request.data)
            historia = actualizar_historia_clinica(id, payload)
            return self.ok(HistoriaClinicaSerializer(historia).data)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        except (DRFValidationError, DjangoValidationError) as exc:
            return self.validation_error(exc)
        except Exception:
            return self.server_error("Error al actualizar historia clinica")

    def patch(self, request, id):
        try:
            historia = obtener_historia_por_id(id)
            payload = self.validated_payload(
                HistoriaClinicaSerializer,
                request.data,
                instance=historia,
                partial=True,
            )
            historia = actualizar_historia_clinica(id, payload)
            return self.ok(HistoriaClinicaSerializer(historia).data)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        except (DRFValidationError, DjangoValidationError) as exc:
            return self.validation_error(exc)
        except Exception:
            return self.server_error("Error al actualizar parcialmente historia clinica")


class CasoListCreateAPIView(BaseHistoriasAPIView):
    def get(self, request, id):
        try:
            casos = obtener_casos_por_historia(id)
            serializer = CasoSerializer(casos, many=True)
            return self.ok_list(serializer.data)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        except Exception:
            return self.server_error("Error al listar casos")

    def post(self, request, id):
        try:
            data = request.data.copy()
            data["historia_clinica"] = id
            payload = self.validated_payload(CasoSerializer, data)
            payload.pop("historia_clinica", None)
            caso = crear_caso(id, payload)
            return self.ok(CasoSerializer(caso).data, status_code=status.HTTP_201_CREATED)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        except (DRFValidationError, DjangoValidationError) as exc:
            return self.validation_error(exc)
        except Exception:
            return self.server_error("Error al crear caso")


class CasoDetailAPIView(BaseHistoriasAPIView):
    def get(self, request, id, caso_id):
        try:
            caso = obtener_caso_por_historia(id, caso_id)
            return self.ok(CasoSerializer(caso).data)
        except (HistoriaClinica.DoesNotExist, Caso.DoesNotExist):
            return self.not_found()
        except Exception:
            return self.server_error("Error al obtener caso")

    def put(self, request, id, caso_id):
        try:
            caso = obtener_caso_por_historia(id, caso_id)
            payload = self.validated_payload(CasoSerializer, request.data, instance=caso)
            payload.pop("historia_clinica", None)
            caso = actualizar_caso(id, caso_id, payload)
            return self.ok(CasoSerializer(caso).data)
        except (HistoriaClinica.DoesNotExist, Caso.DoesNotExist):
            return self.not_found()
        except (DRFValidationError, DjangoValidationError) as exc:
            return self.validation_error(exc)
        except Exception:
            return self.server_error("Error al actualizar caso")

    def patch(self, request, id, caso_id):
        try:
            caso = obtener_caso_por_historia(id, caso_id)
            payload = self.validated_payload(CasoSerializer, request.data, instance=caso, partial=True)
            payload.pop("historia_clinica", None)
            caso = actualizar_caso(id, caso_id, payload)
            return self.ok(CasoSerializer(caso).data)
        except (HistoriaClinica.DoesNotExist, Caso.DoesNotExist):
            return self.not_found()
        except (DRFValidationError, DjangoValidationError) as exc:
            return self.validation_error(exc)
        except Exception:
            return self.server_error("Error al actualizar parcialmente caso")


class AntecedenteListCreateAPIView(BaseHistoriasAPIView):
    def get(self, request, id):
        try:
            antecedentes = obtener_antecedentes_por_historia(id)
            serializer = AntecedenteSerializer(antecedentes, many=True)
            return self.ok_list(serializer.data)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        except Exception:
            return self.server_error("Error al listar antecedentes")

    def post(self, request, id):
        try:
            data = request.data.copy()
            data["historia_clinica"] = id
            payload = self.validated_payload(AntecedenteSerializer, data)
            payload.pop("historia_clinica", None)
            antecedente = crear_antecedente(id, payload)
            return self.ok(AntecedenteSerializer(antecedente).data, status_code=status.HTTP_201_CREATED)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        except (DRFValidationError, DjangoValidationError) as exc:
            return self.validation_error(exc)
        except Exception:
            return self.server_error("Error al crear antecedente")


class AntecedenteDetailAPIView(BaseHistoriasAPIView):
    def get(self, request, id, antecedente_id):
        try:
            antecedente = obtener_antecedente_por_historia(id, antecedente_id)
            return self.ok(AntecedenteSerializer(antecedente).data)
        except (HistoriaClinica.DoesNotExist, Antecedente.DoesNotExist):
            return self.not_found()
        except Exception:
            return self.server_error("Error al obtener antecedente")


class DocumentoListCreateAPIView(BaseHistoriasAPIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, id):
        try:
            documentos = obtener_documentos_por_historia(id)
            serializer = DocumentoSerializer(documentos, many=True, context={"request": request})
            return self.ok_list(serializer.data)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        except Exception:
            return self.server_error("Error al listar documentos")

    def post(self, request, id):
        try:
            data = request.data.copy()
            data["historia_clinica"] = id
            payload = self.validated_payload(
                DocumentoSerializer,
                data,
                context={"request": request},
            )
            payload.pop("historia_clinica", None)
            documento = crear_documento(id, payload)
            serializer = DocumentoSerializer(documento, context={"request": request})
            return self.ok(serializer.data, status_code=status.HTTP_201_CREATED)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        except (DRFValidationError, DjangoValidationError) as exc:
            return self.validation_error(exc)
        except Exception:
            return self.server_error("Error al crear documento")


class DocumentoDetailAPIView(BaseHistoriasAPIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, id, documento_id):
        try:
            documento = obtener_documento_por_historia(id, documento_id)
            serializer = DocumentoSerializer(documento, context={"request": request})
            return self.ok(serializer.data)
        except (HistoriaClinica.DoesNotExist, Documento.DoesNotExist):
            return self.not_found()
        except Exception:
            return self.server_error("Error al obtener documento")
