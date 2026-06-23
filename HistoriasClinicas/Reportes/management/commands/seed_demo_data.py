from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.apps import apps


class Command(BaseCommand):
    help = 'Siembra datos demo dentro del rango de fechas por defecto del frontend (últimos 30 días)'

    def handle(self, *args, **options):
        Servicio = apps.get_model('Agendas', 'Servicio')
        Cita = apps.get_model('Agendas', 'Cita')
        SignosVitales = apps.get_model('Agendas', 'SignosVitales')

        servicios = [
            {'nombre': 'Cardiología', 'descripcion': 'Atención cardiológica'},
            {'nombre': 'Neurología', 'descripcion': 'Atención neurológica'},
            {'nombre': 'Pediatría', 'descripcion': 'Atención pediátrica'},
            {'nombre': 'Medicina General', 'descripcion': 'Atención de medicina general'},
            {'nombre': 'Traumatología', 'descripcion': 'Atención traumatológica'},
        ]
        created_servicios = []
        for s in servicios:
            obj, created = Servicio.objects.get_or_create(
                nombre=s['nombre'],
                defaults={'descripcion': s['descripcion'], 'es_activo': True},
            )
            created_servicios.append(obj)
            if created:
                self.stdout.write(f'  Servicio creado: {obj.nombre}')

        now = timezone.now()
        for i in range(15):
            dias_atras = i * 2
            fecha = now - timedelta(days=dias_atras)
            cita = Cita.objects.create(
                usuario_id=1,
                fecha_hora=fecha,
                estado='ATENDIDA',
                motivo=f'Consulta de rutina #{i + 1}',
            )
            cita.servicios.add(created_servicios[i % len(created_servicios)])
            sv = SignosVitales.objects.create(
                peso_kg=70.0 + (i % 10),
                temperatura=36.5 + (i % 3) * 0.1,
                presion_arterial='120/80',
                frecuencia_cardiaca=72 + i,
            )
            tipos = ['ConsultaMedica', 'ConsultaPsicologica', 'ConsultaOdontologica', 'ConsultaSocial']
            tipo = tipos[i % len(tipos)]
            ConsultaModel = apps.get_model('Agendas', tipo)
            ConsultaModel.objects.create(
                cita=cita,
                historia_clinica_id=1,
                observaciones=f'Observaciones de consulta #{i + 1}',
                **(self._extra_fields(tipo, sv)),
            )
            self.stdout.write(f'  {tipo} creada para cita #{i + 1} (fecha: {fecha.date()})')

        self.stdout.write(self.style.SUCCESS(f'\nDatos demo sembrados: {len(created_servicios)} servicios, 15 citas/consultas'))

    def _extra_fields(self, tipo, sv):
        if tipo == 'ConsultaMedica':
            return {'anamnesis': 'Paciente refiere malestar general', 'tratamiento': 'Reposo y medicación', 'diagnostico': 'J00', 'signos_vitales': sv}
        if tipo == 'ConsultaPsicologica':
            return {'notas_evolucion': 'Paciente muestra mejoría', 'estado_humor': 'Estable', 'nivel_ansiedad': 3, 'nivel_autoestima': 4, 'diagnostico': 'F41'}
        if tipo == 'ConsultaOdontologica':
            return {'odontograma': 'Sin hallazgos relevantes', 'procedimientos': 'Limpieza dental'}
        if tipo == 'ConsultaSocial':
            return {'nivel_socioeconomico': 'Medio', 'descripcion_vivienda': 'Vivienda adecuada'}
        return {}
