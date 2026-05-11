from django.contrib import admin

from .models import Antecedente, Caso, Documento, HistoriaClinica


class CasoInline(admin.TabularInline):
    model = Caso
    extra = 0
    fields = ("fecha_apertura", "fecha_cierre", "estado", "prioridad", "created_at", "updated_at")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-fecha_apertura",)


class AntecedenteInline(admin.TabularInline):
    model = Antecedente
    extra = 0
    fields = ("fecha", "tipo_antecedente", "descripcion", "created_at", "updated_at")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-fecha",)


class DocumentoInline(admin.TabularInline):
    model = Documento
    extra = 0
    fields = ("fecha", "tipo_documento", "archivo", "created_at", "updated_at")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-fecha",)


@admin.register(HistoriaClinica)
class HistoriaClinicaAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "alergia",
        "condicion_preexistente",
        "factor_riesgo",
        "created_at",
        "updated_at",
    )
    search_fields = (
        "alergia",
        "condicion_preexistente",
        "factor_riesgo",
        "antecedente_personal",
        "antecedente_familiar",
    )
    list_filter = ("created_at", "updated_at")
    ordering = ("-created_at",)
    inlines = [CasoInline, AntecedenteInline, DocumentoInline]


@admin.register(Caso)
class CasoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "historia_clinica",
        "fecha_apertura",
        "fecha_cierre",
        "estado",
        "prioridad",
        "created_at",
        "updated_at",
    )
    search_fields = ("id", "historia_clinica__id")
    list_filter = ("estado", "prioridad", "fecha_apertura", "fecha_cierre", "created_at", "updated_at")
    ordering = ("-fecha_apertura", "-created_at")
    autocomplete_fields = ("historia_clinica",)


@admin.register(Antecedente)
class AntecedenteAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "historia_clinica",
        "tipo_antecedente",
        "fecha",
        "created_at",
        "updated_at",
    )
    search_fields = ("descripcion", "historia_clinica__id")
    list_filter = ("tipo_antecedente", "fecha", "created_at", "updated_at")
    ordering = ("-fecha", "-created_at")
    autocomplete_fields = ("historia_clinica",)


@admin.register(Documento)
class DocumentoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "historia_clinica",
        "tipo_documento",
        "fecha",
        "archivo",
        "created_at",
        "updated_at",
    )
    search_fields = ("historia_clinica__id", "archivo")
    list_filter = ("tipo_documento", "fecha", "created_at", "updated_at")
    ordering = ("-fecha", "-created_at")
    autocomplete_fields = ("historia_clinica",)
