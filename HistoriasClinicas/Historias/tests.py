from django.core.exceptions import ValidationError
from django.test import TestCase

from . import services
from .models import Antecedente, Caso, Documento, HistoriaClinica


class BaseServicesTest(TestCase):
    def setUp(self):
        self.historia = HistoriaClinica.objects.create(
            alergia="Penicilina",
            condicion_preexistente="Asma",
            factor_riesgo="Hipertension",
        )
        self.otra_historia = HistoriaClinica.objects.create(
            alergia="Polen",
            condicion_preexistente="Ninguna",
            factor_riesgo="Sedentarismo",
        )

        self.caso = Caso.objects.create(
            historia_clinica=self.historia,
            fecha_apertura="2026-05-13",
            fecha_cierre="2026-05-20",
            estado_caso="ABIERTO",
            prioridad="ALTA",
        )
        self.antecedente = Antecedente.objects.create(
            historia_clinica=self.historia,
            descripcion="Antecedente familiar de diabetes",
            fecha="2026-05-13",
            tipo_antecedente="HEREDOFAMILIARES",
        )
        self.documento = Documento.objects.create(
            historia_clinica=self.historia,
            fecha="2026-05-13",
            encabezado="Resultado medico",
            cuerpo="Contenido del documento clinico",
            tipo_documento="RESULTADO",
        )


class HistoriaClinicaServicesTest(BaseServicesTest):
    def test_crear_historia_clinica(self):
        historia = services.crear_historia_clinica(
            {
                "alergia": "Latex",
                "condicion_preexistente": "Migrena",
                "factor_riesgo": "Tabaquismo",
            }
        )
        self.assertEqual(historia.alergia, "Latex")

    def test_obtener_historia_clinica(self):
        historia = services.obtener_historia_por_id(self.historia.id)
        self.assertEqual(historia.id, self.historia.id)

    def test_listar_historias_clinicas(self):
        historias = services.obtener_historias_clinicas()
        self.assertGreaterEqual(historias.count(), 2)

    def test_actualizar_historia_clinica(self):
        historia = services.actualizar_historia_clinica(
            self.historia.id,
            {"factor_riesgo": "Consumo de alcohol"},
        )
        self.assertEqual(historia.factor_riesgo, "Consumo de alcohol")

    def test_actualizar_historia_clinica_no_permite_id(self):
        historia = services.actualizar_historia_clinica(
            self.historia.id,
            {"id": self.otra_historia.id, "factor_riesgo": "Sedentarismo"},
        )
        self.assertEqual(historia.id, self.historia.id)
        self.assertEqual(historia.factor_riesgo, "Sedentarismo")

    def test_eliminar_historia_clinica(self):
        services.eliminar_historia_clinica(self.historia.id)
        with self.assertRaises(HistoriaClinica.DoesNotExist):
            services.obtener_historia_por_id(self.historia.id)

    def test_crear_historia_clinica_invalida(self):
        with self.assertRaises(ValidationError):
            services.crear_historia_clinica(
                {
                    "alergia": "",
                    "condicion_preexistente": "Asma",
                    "factor_riesgo": "Hipertension",
                }
            )


class CasoServicesTest(BaseServicesTest):
    def test_crear_caso(self):
        caso = services.crear_caso(
            self.historia.id,
            {
                "fecha_apertura": "2026-06-01",
                "fecha_cierre": "2026-06-15",
                "estado_caso": "EN_SEGUIMIENTO",
                "prioridad": "MEDIA",
            },
        )
        self.assertEqual(caso.historia_clinica_id, self.historia.id)

    def test_obtener_caso(self):
        caso = services.obtener_caso_por_historia(self.historia.id, self.caso.id)
        self.assertEqual(caso.id, self.caso.id)

    def test_listar_casos(self):
        casos = services.obtener_casos_por_historia(self.historia.id)
        self.assertGreaterEqual(casos.count(), 1)

    def test_actualizar_caso(self):
        caso = services.actualizar_caso(
            self.historia.id,
            self.caso.id,
            {"estado_caso": "CERRADO", "fecha_cierre": "2026-05-20"},
        )
        self.assertEqual(caso.estado_caso, "CERRADO")

    def test_actualizar_caso_no_permite_cambiar_historia_clinica(self):
        caso = services.actualizar_caso(
            self.historia.id,
            self.caso.id,
            {
                "historia_clinica": self.otra_historia.id,
                "historia_clinica_id": self.otra_historia.id,
                "prioridad": "BAJA",
            },
        )
        self.assertEqual(caso.historia_clinica_id, self.historia.id)
        self.assertEqual(caso.prioridad, "BAJA")

    def test_eliminar_caso(self):
        services.eliminar_caso(self.historia.id, self.caso.id)
        with self.assertRaises(Caso.DoesNotExist):
            services.obtener_caso_por_historia(self.historia.id, self.caso.id)

    def test_crear_caso_con_estado_invalido(self):
        with self.assertRaises(ValidationError):
            services.crear_caso(
                self.historia.id,
                {
                    "fecha_apertura": "2026-06-01",
                    "fecha_cierre": "2026-06-15",
                    "estado_caso": "INVALIDO",
                    "prioridad": "ALTA",
                },
            )

    def test_crear_caso_con_prioridad_invalida(self):
        with self.assertRaises(ValidationError):
            services.crear_caso(
                self.historia.id,
                {
                    "fecha_apertura": "2026-06-01",
                    "fecha_cierre": "2026-06-15",
                    "estado_caso": "ABIERTO",
                    "prioridad": "URGENTE",
                },
            )


class AntecedenteServicesTest(BaseServicesTest):
    def test_crear_antecedente(self):
        antecedente = services.crear_antecedente(
            self.historia.id,
            {
                "descripcion": "Sin antecedentes patologicos",
                "fecha": "2026-06-01",
                "tipo_antecedente": "PERSONALES_NO_PATOLOGICOS",
            },
        )
        self.assertEqual(antecedente.historia_clinica_id, self.historia.id)

    def test_obtener_antecedente(self):
        antecedente = services.obtener_antecedente_por_historia(self.historia.id, self.antecedente.id)
        self.assertEqual(antecedente.id, self.antecedente.id)

    def test_listar_antecedentes(self):
        antecedentes = services.obtener_antecedentes_por_historia(self.historia.id)
        self.assertGreaterEqual(antecedentes.count(), 1)

    def test_actualizar_antecedente(self):
        antecedente = services.actualizar_antecedente(
            self.historia.id,
            self.antecedente.id,
            {"descripcion": "Descripcion actualizada"},
        )
        self.assertEqual(antecedente.descripcion, "Descripcion actualizada")

    def test_actualizar_antecedente_no_permite_cambiar_historia_clinica(self):
        antecedente = services.actualizar_antecedente(
            self.historia.id,
            self.antecedente.id,
            {
                "historia_clinica": self.otra_historia.id,
                "historia_clinica_id": self.otra_historia.id,
                "descripcion": "Cambio permitido",
            },
        )
        self.assertEqual(antecedente.historia_clinica_id, self.historia.id)
        self.assertEqual(antecedente.descripcion, "Cambio permitido")

    def test_eliminar_antecedente(self):
        services.eliminar_antecedente(self.historia.id, self.antecedente.id)
        with self.assertRaises(Antecedente.DoesNotExist):
            services.obtener_antecedente_por_historia(self.historia.id, self.antecedente.id)

    def test_crear_antecedente_con_tipo_invalido(self):
        with self.assertRaises(ValidationError):
            services.crear_antecedente(
                self.historia.id,
                {
                    "descripcion": "Dato invalido",
                    "fecha": "2026-06-01",
                    "tipo_antecedente": "TIPO_INVALIDO",
                },
            )


class DocumentoServicesTest(BaseServicesTest):
    def test_crear_documento(self):
        documento = services.crear_documento(
            self.historia.id,
            {
                "fecha": "2026-06-01",
                "encabezado": "Nuevo documento",
                "cuerpo": "Contenido textual",
                "tipo_documento": "CERTIFICADO",
            },
        )
        self.assertEqual(documento.historia_clinica_id, self.historia.id)

    def test_obtener_documento(self):
        documento = services.obtener_documento_por_historia(self.historia.id, self.documento.id)
        self.assertEqual(documento.id, self.documento.id)

    def test_listar_documentos(self):
        documentos = services.obtener_documentos_por_historia(self.historia.id)
        self.assertGreaterEqual(documentos.count(), 1)

    def test_actualizar_documento(self):
        documento = services.actualizar_documento(
            self.historia.id,
            self.documento.id,
            {"encabezado": "Encabezado actualizado"},
        )
        self.assertEqual(documento.encabezado, "Encabezado actualizado")

    def test_actualizar_documento_no_permite_cambiar_historia_clinica(self):
        documento = services.actualizar_documento(
            self.historia.id,
            self.documento.id,
            {
                "historia_clinica": self.otra_historia.id,
                "historia_clinica_id": self.otra_historia.id,
                "cuerpo": "Cambio parcial valido",
            },
        )
        self.assertEqual(documento.historia_clinica_id, self.historia.id)
        self.assertEqual(documento.cuerpo, "Cambio parcial valido")

    def test_eliminar_documento(self):
        services.eliminar_documento(self.historia.id, self.documento.id)
        with self.assertRaises(Documento.DoesNotExist):
            services.obtener_documento_por_historia(self.historia.id, self.documento.id)

    def test_crear_documento_sin_encabezado(self):
        with self.assertRaises(ValidationError):
            services.crear_documento(
                self.historia.id,
                {
                    "fecha": "2026-06-01",
                    "cuerpo": "Contenido",
                    "tipo_documento": "RESULTADO",
                },
            )

    def test_crear_documento_sin_cuerpo(self):
        with self.assertRaises(ValidationError):
            services.crear_documento(
                self.historia.id,
                {
                    "fecha": "2026-06-01",
                    "encabezado": "Encabezado",
                    "tipo_documento": "RESULTADO",
                },
            )

    def test_crear_documento_con_tipo_invalido(self):
        with self.assertRaises(ValidationError):
            services.crear_documento(
                self.historia.id,
                {
                    "fecha": "2026-06-01",
                    "encabezado": "Encabezado",
                    "cuerpo": "Contenido",
                    "tipo_documento": "TIPO_INVALIDO",
                },
            )
