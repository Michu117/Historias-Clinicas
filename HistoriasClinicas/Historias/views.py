from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import permissions, status
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Antecedente, Caso, Documento, HistoriaClinica
from .serializers import (AntecedenteSerializer,CasoSerializer,DocumentoSerializer,HistoriaClinicaSerializer,)
from .services import (actualizar_historia_clinica,crear_historia_clinica,obtener_historia_por_id,obtener_historias_clinicas,)


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

    def _error_detail(self, exc):
        return getattr(exc, "detail", None) or getattr(exc, "message_dict", None) or {
            "non_field_errors": [str(exc)]
        }

    def _historia_from_payload(self, request):
        historia_id = request.data.get("historia_clinica")
        if historia_id in (None, ""):
            raise DRFValidationError({"historia_clinica": ["This field is required."]})
        try:
            historia_pk = int(historia_id)
        except (TypeError, ValueError) as exc:
            raise DRFValidationError({"historia_clinica": ["Invalid value."]}) from exc
        return HistoriaClinica.objects.get(pk=historia_pk)

    def _update_instance(self, serializer_class, instance, data, partial=False):
        serializer = serializer_class(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        for field, value in serializer.validated_data.items():
            setattr(instance, field, value)
        instance.full_clean()
        instance.save()
        return instance


class HistoriaClinicaListCreateView(BaseHistoriasView):
    def get(self, request):
        historias = obtener_historias_clinicas()
        return self.ok_list(HistoriaClinicaSerializer(historias, many=True).data)

    def post(self, request):
        serializer = HistoriaClinicaSerializer(data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        try:
            historia = crear_historia_clinica(serializer.validated_data)
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        return self.created(HistoriaClinicaSerializer(historia).data)


class HistoriaClinicaDetailView(BaseHistoriasView):
    def get(self, request, pk):
        try:
            historia = obtener_historia_por_id(pk)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        return self.ok(HistoriaClinicaSerializer(historia).data)

    def put(self, request, pk):
        try:
            historia = obtener_historia_por_id(pk)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        serializer = HistoriaClinicaSerializer(historia, data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        try:
            historia = actualizar_historia_clinica(pk, serializer.validated_data)
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        return self.ok(HistoriaClinicaSerializer(historia).data)

    def patch(self, request, pk):
        try:
            historia = obtener_historia_por_id(pk)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        serializer = HistoriaClinicaSerializer(historia, data=request.data, partial=True)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        try:
            historia = actualizar_historia_clinica(pk, serializer.validated_data)
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        return self.ok(HistoriaClinicaSerializer(historia).data)

    def delete(self, request, pk):
        try:
            historia = obtener_historia_por_id(pk)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        historia.delete()
        return self.ok({})


class CasoListCreateView(BaseHistoriasView):
    def get(self, request):
        casos = Caso.objects.select_related("historia_clinica").all()
        return self.ok_list(CasoSerializer(casos, many=True).data)

    def post(self, request):
        serializer = CasoSerializer(data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        try:
            historia = self._historia_from_payload(request)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        except DRFValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        try:
            caso = Caso.objects.create(historia_clinica=historia, **serializer.validated_data)
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        return self.created(CasoSerializer(caso).data)


class CasoDetailView(BaseHistoriasView):
    def get(self, request, pk):
        try:
            caso = Caso.objects.select_related("historia_clinica").get(pk=pk)
        except Caso.DoesNotExist:
            return self.not_found()
        return self.ok(CasoSerializer(caso).data)

    def put(self, request, pk):
        try:
            caso = Caso.objects.select_related("historia_clinica").get(pk=pk)
        except Caso.DoesNotExist:
            return self.not_found()
        try:
            caso = self._update_instance(CasoSerializer, caso, request.data)
        except (DRFValidationError, DjangoValidationError) as exc:
            return self.validation_error(self._error_detail(exc))
        return self.ok(CasoSerializer(caso).data)

    def patch(self, request, pk):
        try:
            caso = Caso.objects.select_related("historia_clinica").get(pk=pk)
        except Caso.DoesNotExist:
            return self.not_found()
        try:
            caso = self._update_instance(CasoSerializer, caso, request.data, partial=True)
        except (DRFValidationError, DjangoValidationError) as exc:
            return self.validation_error(self._error_detail(exc))
        return self.ok(CasoSerializer(caso).data)

    def delete(self, request, pk):
        try:
            caso = Caso.objects.get(pk=pk)
        except Caso.DoesNotExist:
            return self.not_found()
        caso.delete()
        return self.ok({})


class AntecedenteListCreateView(BaseHistoriasView):
    def get(self, request):
        antecedentes = Antecedente.objects.select_related("historia_clinica").all()
        return self.ok_list(AntecedenteSerializer(antecedentes, many=True).data)

    def post(self, request):
        serializer = AntecedenteSerializer(data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        try:
            historia = self._historia_from_payload(request)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        except DRFValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        try:
            antecedente = Antecedente.objects.create(
                historia_clinica=historia,
                **serializer.validated_data,
            )
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        return self.created(AntecedenteSerializer(antecedente).data)


class AntecedenteDetailView(BaseHistoriasView):
    def get(self, request, pk):
        try:
            antecedente = Antecedente.objects.select_related("historia_clinica").get(pk=pk)
        except Antecedente.DoesNotExist:
            return self.not_found()
        return self.ok(AntecedenteSerializer(antecedente).data)

    def put(self, request, pk):
        try:
            antecedente = Antecedente.objects.select_related("historia_clinica").get(pk=pk)
        except Antecedente.DoesNotExist:
            return self.not_found()
        try:
            antecedente = self._update_instance(AntecedenteSerializer, antecedente, request.data)
        except (DRFValidationError, DjangoValidationError) as exc:
            return self.validation_error(self._error_detail(exc))
        return self.ok(AntecedenteSerializer(antecedente).data)

    def patch(self, request, pk):
        try:
            antecedente = Antecedente.objects.select_related("historia_clinica").get(pk=pk)
        except Antecedente.DoesNotExist:
            return self.not_found()
        try:
            antecedente = self._update_instance(
                AntecedenteSerializer,
                antecedente,
                request.data,
                partial=True,
            )
        except (DRFValidationError, DjangoValidationError) as exc:
            return self.validation_error(self._error_detail(exc))
        return self.ok(AntecedenteSerializer(antecedente).data)

    def delete(self, request, pk):
        try:
            antecedente = Antecedente.objects.get(pk=pk)
        except Antecedente.DoesNotExist:
            return self.not_found()
        antecedente.delete()
        return self.ok({})


class DocumentoListCreateView(BaseHistoriasView):
    def get(self, request):
        documentos = Documento.objects.select_related("historia_clinica").all()
        return self.ok_list(DocumentoSerializer(documentos, many=True).data)

    def post(self, request):
        serializer = DocumentoSerializer(data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        try:
            historia = self._historia_from_payload(request)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        except DRFValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        try:
            documento = Documento.objects.create(historia_clinica=historia, **serializer.validated_data)
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        return self.created(DocumentoSerializer(documento).data)


class DocumentoDetailView(BaseHistoriasView):
    def get(self, request, pk):
        try:
            documento = Documento.objects.select_related("historia_clinica").get(pk=pk)
        except Documento.DoesNotExist:
            return self.not_found()
        return self.ok(DocumentoSerializer(documento).data)

    def put(self, request, pk):
        try:
            documento = Documento.objects.select_related("historia_clinica").get(pk=pk)
        except Documento.DoesNotExist:
            return self.not_found()
        try:
            documento = self._update_instance(DocumentoSerializer, documento, request.data)
        except (DRFValidationError, DjangoValidationError) as exc:
            return self.validation_error(self._error_detail(exc))
        return self.ok(DocumentoSerializer(documento).data)

    def patch(self, request, pk):
        try:
            documento = Documento.objects.select_related("historia_clinica").get(pk=pk)
        except Documento.DoesNotExist:
            return self.not_found()
        try:
            documento = self._update_instance(DocumentoSerializer, documento, request.data, partial=True)
        except (DRFValidationError, DjangoValidationError) as exc:
            return self.validation_error(self._error_detail(exc))
        return self.ok(DocumentoSerializer(documento).data)

    def delete(self, request, pk):
        try:
            documento = Documento.objects.get(pk=pk)
        except Documento.DoesNotExist:
            return self.not_found()
        documento.delete()
        return self.ok({})
