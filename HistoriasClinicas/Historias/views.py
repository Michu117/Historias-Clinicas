from django.core.exceptions import ValidationError as DjangoValidationError
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions, status
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Antecedente, Caso, Documento, HistoriaClinica
from .serializers import (
    AntecedenteSerializer,
    CasoSerializer,
    DocumentoSerializer,
    HistoriaClinicaSerializer,
)
from .services import (
    actualizar_historia_clinica,
    crear_historia_clinica,
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

    def _error_detail(self, exc):
        return getattr(exc, "detail", None) or getattr(exc, "message_dict", None) or {
            "non_field_errors": [str(exc)]
        }

    def _historia_from_user(self, request):
        perfil = getattr(request.user, "perfil", None)
        if perfil is None:
            raise DRFValidationError(
                {"usuario": ["El usuario autenticado no tiene un perfil asociado."]}
            )
        try:
            return perfil.historia_clinica
        except HistoriaClinica.DoesNotExist as exc:
            raise DRFValidationError(
                {"historia_clinica": ["El usuario autenticado no tiene historia clinica registrada."]}
            ) from exc


class HistoriaClinicaListCreateView(BaseHistoriasView):
    def get(self, request):
        historias = obtener_historias_clinicas().filter(usuario=request.user.perfil)
        return self.ok_list(HistoriaClinicaSerializer(historias, many=True).data)

    @extend_schema(
        request=HistoriaClinicaSerializer,
        responses=HistoriaClinicaSerializer,
    )
    def post(self, request):
        serializer = HistoriaClinicaSerializer(data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)

        if HistoriaClinica.objects.filter(usuario=request.user.perfil).exists():
            return self.validation_error(
                {
                    "usuario": [
                        "El usuario autenticado ya tiene una historia clinica registrada.",
                    ]
                }
            )

        try:
            historia = crear_historia_clinica(
                serializer.validated_data,
                usuario=request.user.perfil,
            )
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))

        return self.created(HistoriaClinicaSerializer(historia).data)


@extend_schema_view(
    patch=extend_schema(
        request=HistoriaClinicaSerializer,
        responses=HistoriaClinicaSerializer,
    ),
)
class HistoriaClinicaDetailView(BaseHistoriasView):
    def get(self, request, pk):
        try:
            historia = obtener_historia_por_id(pk, usuario=request.user.perfil)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        return self.ok(HistoriaClinicaSerializer(historia).data)

    @extend_schema(
        request=HistoriaClinicaSerializer,
        responses=HistoriaClinicaSerializer,
    )
    def put(self, request, pk):
        try:
            historia = obtener_historia_por_id(pk, usuario=request.user.perfil)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()

        serializer = HistoriaClinicaSerializer(historia, data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)

        try:
            historia = actualizar_historia_clinica(
                pk,
                serializer.validated_data,
                usuario=request.user.perfil,
            )
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        return self.ok(HistoriaClinicaSerializer(historia).data)

    @extend_schema(
        request=HistoriaClinicaSerializer,
        responses=HistoriaClinicaSerializer,
    )
    def patch(self, request, pk):
        try:
            historia = obtener_historia_por_id(pk, usuario=request.user.perfil)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()

        serializer = HistoriaClinicaSerializer(historia, data=request.data, partial=True)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)
        try:
            historia = actualizar_historia_clinica(
                pk,
                serializer.validated_data,
                usuario=request.user.perfil,
            )
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        return self.ok(HistoriaClinicaSerializer(historia).data)

    def delete(self, request, pk):
        try:
            historia = obtener_historia_por_id(pk, usuario=request.user.perfil)
        except HistoriaClinica.DoesNotExist:
            return self.not_found()
        historia.delete()
        return self.ok({})


class CasoListCreateView(BaseHistoriasView):
    def get(self, request):
        casos = Caso.objects.select_related("historia_clinica").filter(
            historia_clinica__usuario=request.user.perfil
        )
        return self.ok_list(CasoSerializer(casos, many=True).data)

    @extend_schema(
        request=CasoSerializer,
        responses=CasoSerializer,
    )
    def post(self, request):
        serializer = CasoSerializer(data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)

        try:
            historia = self._historia_from_user(request)
        except DRFValidationError as exc:
            return self.validation_error(self._error_detail(exc))

        try:
            caso = serializer.save(historia_clinica=historia)
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        return self.created(CasoSerializer(caso).data)


class CasoDetailView(BaseHistoriasView):
    def get(self, request, pk):
        try:
            caso = Caso.objects.select_related("historia_clinica").get(
                pk=pk,
                historia_clinica__usuario=request.user.perfil,
            )
        except Caso.DoesNotExist:
            return self.not_found()
        return self.ok(CasoSerializer(caso).data)

    @extend_schema(
        request=CasoSerializer,
        responses=CasoSerializer,
    )
    def put(self, request, pk):
        try:
            caso = Caso.objects.select_related("historia_clinica").get(
                pk=pk,
                historia_clinica__usuario=request.user.perfil,
            )
        except Caso.DoesNotExist:
            return self.not_found()

        serializer = CasoSerializer(caso, data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)

        try:
            caso = serializer.save()
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))

        return self.ok(CasoSerializer(caso).data)

    @extend_schema(
        request=CasoSerializer,
        responses=CasoSerializer,
    )
    def patch(self, request, pk):
        try:
            caso = Caso.objects.select_related("historia_clinica").get(
                pk=pk,
                historia_clinica__usuario=request.user.perfil,
            )
        except Caso.DoesNotExist:
            return self.not_found()

        serializer = CasoSerializer(
            caso,
            data=request.data,
            partial=True,
        )
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)

        try:
            caso = serializer.save()
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))

        return self.ok(CasoSerializer(caso).data)

    def delete(self, request, pk):
        try:
            caso = Caso.objects.get(
                pk=pk,
                historia_clinica__usuario=request.user.perfil,
            )
        except Caso.DoesNotExist:
            return self.not_found()
        caso.delete()
        return self.ok({})


class AntecedenteListCreateView(BaseHistoriasView):
    def get(self, request):
        antecedentes = Antecedente.objects.select_related("historia_clinica").filter(
            historia_clinica__usuario=request.user.perfil
        )
        return self.ok_list(AntecedenteSerializer(antecedentes, many=True).data)

    @extend_schema(
        request=AntecedenteSerializer,
        responses=AntecedenteSerializer,
    )
    def post(self, request):
        serializer = AntecedenteSerializer(data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)

        try:
            historia = self._historia_from_user(request)
        except DRFValidationError as exc:
            return self.validation_error(self._error_detail(exc))

        try:
            antecedente = serializer.save(historia_clinica=historia)
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        return self.created(AntecedenteSerializer(antecedente).data)


class AntecedenteDetailView(BaseHistoriasView):
    def get(self, request, pk):
        try:
            antecedente = Antecedente.objects.select_related("historia_clinica").get(
                pk=pk,
                historia_clinica__usuario=request.user.perfil,
            )
        except Antecedente.DoesNotExist:
            return self.not_found()
        return self.ok(AntecedenteSerializer(antecedente).data)

    @extend_schema(
        request=AntecedenteSerializer,
        responses=AntecedenteSerializer,
    )
    def put(self, request, pk):
        try:
            antecedente = Antecedente.objects.select_related("historia_clinica").get(
                pk=pk,
                historia_clinica__usuario=request.user.perfil,
            )
        except Antecedente.DoesNotExist:
            return self.not_found()

        serializer = AntecedenteSerializer(
            antecedente,
            data=request.data,
        )
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)

        try:
            antecedente = serializer.save()
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))

        return self.ok(AntecedenteSerializer(antecedente).data)

    @extend_schema(
        request=AntecedenteSerializer,
        responses=AntecedenteSerializer,
    )
    def patch(self, request, pk):
        try:
            antecedente = Antecedente.objects.select_related("historia_clinica").get(
                pk=pk,
                historia_clinica__usuario=request.user.perfil,
            )
        except Antecedente.DoesNotExist:
            return self.not_found()

        serializer = AntecedenteSerializer(
            antecedente,
            data=request.data,
            partial=True,
        )
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)

        try:
            antecedente = serializer.save()
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))

        return self.ok(AntecedenteSerializer(antecedente).data)

    def delete(self, request, pk):
        try:
            antecedente = Antecedente.objects.get(
                pk=pk,
                historia_clinica__usuario=request.user.perfil,
            )
        except Antecedente.DoesNotExist:
            return self.not_found()
        antecedente.delete()
        return self.ok({})


class DocumentoListCreateView(BaseHistoriasView):
    def get(self, request):
        documentos = Documento.objects.select_related("historia_clinica").filter(
            historia_clinica__usuario=request.user.perfil
        )
        return self.ok_list(DocumentoSerializer(documentos, many=True).data)

    @extend_schema(
        request=DocumentoSerializer,
        responses=DocumentoSerializer,
    )
    def post(self, request):
        serializer = DocumentoSerializer(data=request.data)
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)

        try:
            historia = self._historia_from_user(request)
        except DRFValidationError as exc:
            return self.validation_error(self._error_detail(exc))

        try:
            documento = serializer.save(historia_clinica=historia)
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))
        return self.created(DocumentoSerializer(documento).data)


@extend_schema_view(
    patch=extend_schema(
        request=DocumentoSerializer,
        responses=DocumentoSerializer,
    ),
)
class DocumentoDetailView(BaseHistoriasView):
    def get(self, request, pk):
        try:
            documento = Documento.objects.select_related("historia_clinica").get(
                pk=pk,
                historia_clinica__usuario=request.user.perfil,
            )
        except Documento.DoesNotExist:
            return self.not_found()
        return self.ok(DocumentoSerializer(documento).data)

    @extend_schema(
        request=DocumentoSerializer,
        responses=DocumentoSerializer,
    )
    def put(self, request, pk):
        try:
            documento = Documento.objects.select_related("historia_clinica").get(
                pk=pk,
                historia_clinica__usuario=request.user.perfil,
            )
        except Documento.DoesNotExist:
            return self.not_found()

        serializer = DocumentoSerializer(
            documento,
            data=request.data,
        )
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)

        try:
            documento = serializer.save()
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))

        return self.ok(DocumentoSerializer(documento).data)

    @extend_schema(
        request=DocumentoSerializer,
        responses=DocumentoSerializer,
    )
    def patch(self, request, pk):
        try:
            documento = Documento.objects.select_related("historia_clinica").get(
                pk=pk,
                historia_clinica__usuario=request.user.perfil,
            )
        except Documento.DoesNotExist:
            return self.not_found()

        serializer = DocumentoSerializer(
            documento,
            data=request.data,
            partial=True,
        )
        if not serializer.is_valid():
            return self.validation_error(serializer.errors)

        try:
            documento = serializer.save()
        except DjangoValidationError as exc:
            return self.validation_error(self._error_detail(exc))

        return self.ok(DocumentoSerializer(documento).data)

    def delete(self, request, pk):
        try:
            documento = Documento.objects.get(
                pk=pk,
                historia_clinica__usuario=request.user.perfil,
            )
        except Documento.DoesNotExist:
            return self.not_found()
        documento.delete()
        return self.ok({})
