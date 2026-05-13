from django.urls import path

from .views import (
    AntecedenteDetailAPIView,
    AntecedenteListCreateAPIView,
    CasoDetailAPIView,
    CasoListCreateAPIView,
    DocumentoDetailAPIView,
    DocumentoListCreateAPIView,
    HistoriaClinicaDetailAPIView,
    HistoriaClinicaListCreateAPIView,
)

app_name = "historias"

urlpatterns = [
    path(
        "historias-clinicas/",
        HistoriaClinicaListCreateAPIView.as_view(),
        name="historias-clinicas-list-create",
    ),
    path(
        "historias-clinicas/<int:id>/",
        HistoriaClinicaDetailAPIView.as_view(),
        name="historias-clinicas-detail",
    ),
    path(
        "historias-clinicas/<int:id>/casos/",
        CasoListCreateAPIView.as_view(),
        name="historias-clinicas-casos-list-create",
    ),
    path(
        "historias-clinicas/<int:id>/casos/<int:caso_id>/",
        CasoDetailAPIView.as_view(),
        name="historias-clinicas-casos-detail",
    ),
    path(
        "historias-clinicas/<int:id>/antecedentes/",
        AntecedenteListCreateAPIView.as_view(),
        name="historias-clinicas-antecedentes-list-create",
    ),
    path(
        "historias-clinicas/<int:id>/antecedentes/<int:antecedente_id>/",
        AntecedenteDetailAPIView.as_view(),
        name="historias-clinicas-antecedentes-detail",
    ),
    path(
        "historias-clinicas/<int:id>/documentos/",
        DocumentoListCreateAPIView.as_view(),
        name="historias-clinicas-documentos-list-create",
    ),
    path(
        "historias-clinicas/<int:id>/documentos/<int:documento_id>/",
        DocumentoDetailAPIView.as_view(),
        name="historias-clinicas-documentos-detail",
    ),
]
