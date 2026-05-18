from django.contrib import admin

from .models import Antecedente, Caso, Documento, HistoriaClinica

@admin.register(HistoriaClinica)
class HistoriaClinicaAdmin(admin.ModelAdmin):
    list_display = ("id", "alergia", "condicion_preexistente","factor_riesgo","created_at","updated_at",)
    search_fields = ("alergia", "condicion_preexistente","factor_riesgo",)
    list_filter = ("created_at", "updated_at")
    ordering = ("-created_at",)

@admin.register(Caso)
class CasoAdmin(admin.ModelAdmin):
    list_display = ( "id", "historia_clinica","fecha_apertura","fecha_cierre","estado_caso","prioridad","created_at",  "updated_at",)
    search_fields = ("id", "historia_clinica__id")
    list_filter = ("estado_caso", "prioridad", "fecha_apertura", "fecha_cierre", "created_at", "updated_at")
    ordering = ("-fecha_apertura", "-created_at")
    autocomplete_fields = ("historia_clinica",)


@admin.register(Antecedente)
class AntecedenteAdmin(admin.ModelAdmin):
    list_display = ("id","historia_clinica","tipo_antecedente","fecha","created_at","updated_at",)
    search_fields = ("descripcion", "historia_clinica__id")
    list_filter = ("tipo_antecedente", "fecha", "created_at", "updated_at")
    ordering = ("-fecha", "-created_at")
    autocomplete_fields = ("historia_clinica",)


@admin.register(Documento)
class DocumentoAdmin(admin.ModelAdmin):
    list_display = ("id","historia_clinica","tipo_documento","fecha","encabezado","created_at","updated_at",
    )
    search_fields = ("historia_clinica__id", "encabezado", "cuerpo")
    list_filter = ("tipo_documento", "fecha", "created_at", "updated_at")
    ordering = ("-fecha", "-created_at")
    autocomplete_fields = ("historia_clinica",)
