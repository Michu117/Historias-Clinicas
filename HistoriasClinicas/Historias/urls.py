from django.urls import path

from . import views

urlpatterns = [
    path("Historias-clinicas/",views.HistoriaClinicaListCreateView.as_view(),name="historia-clinica-list",),
    path("Historias-clinicas/<int:pk>/",views.HistoriaClinicaDetailView.as_view(),name="historia-clinica-detail",),
    path("casos/",views.CasoListCreateView.as_view(),name="caso-list",),
    path("casos/<int:pk>/",views.CasoDetailView.as_view(),name="caso-detail",),
    path("antecedentes/",views.AntecedenteListCreateView.as_view(),name="antecedente-list",),
    path("antecedentes/<int:pk>/",views.AntecedenteDetailView.as_view(),name="antecedente-detail",),
    path("documentos/",views.DocumentoListCreateView.as_view(),name="documento-list",),
    path("documentos/<int:pk>/",views.DocumentoDetailView.as_view(),name="documento-detail",
    ),
]
