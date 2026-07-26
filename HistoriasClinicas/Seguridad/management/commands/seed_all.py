from datetime import timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.apps import apps

ROLES = {
    'admin': 'Administrador del sistema',
    'medico': 'Médico profesional',
    'psicologo': 'Psicólogo profesional',
    'odontologo': 'Odontólogo profesional',
    'trabajador_social': 'Trabajador Social profesional',
    'paciente': 'Paciente',
    'estudiante': 'Estudiante',
}

PROFESIONALES = [
    {
        'correo': 'dr.juan@medicampus.com',
        'clave': 'MediCampus2024!',
        'rol': 'medico',
        'nombres': 'Juan',
        'apellidos': 'Pérez García',
        'cedula': '0102030405',
        'fecha_nacimiento': '1980-05-15',
        'sexo': 'H',
    },
    {
        'correo': 'dra.maria@medicampus.com',
        'clave': 'MediCampus2024!',
        'rol': 'psicologo',
        'nombres': 'María',
        'apellidos': 'López Martínez',
        'cedula': '0102030406',
        'fecha_nacimiento': '1985-08-22',
        'sexo': 'M',
    },
    {
        'correo': 'dr.carlos@medicampus.com',
        'clave': 'MediCampus2024!',
        'rol': 'odontologo',
        'nombres': 'Carlos',
        'apellidos': 'Mendoza Rivera',
        'cedula': '0102030407',
        'fecha_nacimiento': '1982-11-10',
        'sexo': 'H',
    },
    {
        'correo': 'ts.ana@medicampus.com',
        'clave': 'MediCampus2024!',
        'rol': 'trabajador_social',
        'nombres': 'Ana',
        'apellidos': 'Cruz Villalta',
        'cedula': '0102030408',
        'fecha_nacimiento': '1990-03-18',
        'sexo': 'M',
    },
    {
        'correo': 'est.pedro@medicampus.com',
        'clave': 'MediCampus2024!',
        'rol': 'estudiante',
        'nombres': 'Pedro',
        'apellidos': 'Ramírez Soto',
        'cedula': '0102030409',
        'fecha_nacimiento': '2000-07-12',
        'sexo': 'H',
    },
]

PACIENTES = [
    {
        'correo': 'laura.garcia@email.com',
        'clave': 'Paciente12345.',
        'nombres': 'Laura',
        'apellidos': 'García Mendoza',
        'cedula': '1002003001',
        'fecha_nacimiento': '1995-03-22',
        'sexo': 'M',
    },
    {
        'correo': 'roberto.castro@email.com',
        'clave': 'Paciente12345.',
        'nombres': 'Roberto',
        'apellidos': 'Castro Jiménez',
        'cedula': '1002003002',
        'fecha_nacimiento': '1988-11-05',
        'sexo': 'H',
    },
    {
        'correo': 'carmen.ruiz@email.com',
        'clave': 'Paciente12345.',
        'nombres': 'Carmen',
        'apellidos': 'Ruiz Delgado',
        'cedula': '1002003003',
        'fecha_nacimiento': '1975-06-18',
        'sexo': 'M',
    },
    {
        'correo': 'diego.morales@email.com',
        'clave': 'Paciente12345.',
        'nombres': 'Diego',
        'apellidos': 'Morales Herrera',
        'cedula': '1002003004',
        'fecha_nacimiento': '2002-01-30',
        'sexo': 'H',
    },
    {
        'correo': 'sofia.vega@email.com',
        'clave': 'Paciente12345.',
        'nombres': 'Sofía',
        'apellidos': 'Vega Torres',
        'cedula': '1002003005',
        'fecha_nacimiento': '1992-09-14',
        'sexo': 'M',
    },
]

SERVICIOS = [
    {'nombre': 'Cardiología', 'descripcion': 'Atención cardiológica especializada'},
    {'nombre': 'Neurología', 'descripcion': 'Atención neurológica especializada'},
    {'nombre': 'Pediatría', 'descripcion': 'Atención pediátrica integral'},
    {'nombre': 'Medicina General', 'descripcion': 'Atención de medicina general'},
    {'nombre': 'Traumatología', 'descripcion': 'Atención traumatológica y ortopédica'},
    {'nombre': 'Psicología', 'descripcion': 'Atención psicológica y emocional'},
    {'nombre': 'Odontología', 'descripcion': 'Atención odontológica general'},
    {'nombre': 'Medicina Interna', 'descripcion': 'Atención de medicina interna'},
    {'nombre': 'Dermatología', 'descripcion': 'Atención dermatológica'},
    {'nombre': 'Ginecología', 'descripcion': 'Atención ginecológica'},
]

ANTECEDENTES_PACIENTES = {
    'laura.garcia@email.com': [
        {'tipo': 'PERSONALES_PATOLOGICOS', 'descripcion': 'Asma bronquial diagnosticada en 2010', 'dias_atras': 1800},
        {'tipo': 'HEREDOFAMILIARES', 'descripcion': 'Madre con diabetes tipo 2', 'dias_atras': 1500},
        {'tipo': 'PERSONALES_NO_PATOLOGICOS', 'descripcion': 'Vacunación completa, no fumadora', 'dias_atras': 1200},
    ],
    'roberto.castro@email.com': [
        {'tipo': 'PERSONALES_PATOLOGICOS', 'descripcion': 'Hipertensión arterial diagnosticada en 2020', 'dias_atras': 1100},
        {'tipo': 'HEREDOFAMILIARES', 'descripcion': 'Padre con cardiopatía isquémica', 'dias_atras': 900},
        {'tipo': 'PERSONALES_NO_PATOLOGICOS', 'descripcion': 'Sedentario ocasional, consume alcohol socialmente', 'dias_atras': 800},
    ],
    'carmen.ruiz@email.com': [
        {'tipo': 'PERSONALES_PATOLOGICOS', 'descripcion': 'Diabetes tipo 2, hipotiroidismo', 'dias_atras': 2000},
        {'tipo': 'PERSONALES_NO_PATOLOGICOS', 'descripcion': 'Alergia a penicilina', 'dias_atras': 1500},
        {'tipo': 'GINECO_OBSTETRICOS', 'descripcion': '2 gestaciones, 2 partos eutócicos', 'dias_atras': 1000},
    ],
    'diego.morales@email.com': [
        {'tipo': 'PERSONALES_NO_PATOLOGICOS', 'descripcion': 'Deportista, sin hábitos nocivos', 'dias_atras': 800},
        {'tipo': 'HEREDOFAMILIARES', 'descripcion': 'Abuelo con cáncer de colon', 'dias_atras': 500},
    ],
    'sofia.vega@email.com': [
        {'tipo': 'PERSONALES_PATOLOGICOS', 'descripcion': 'Migraña crónica, ansiedad generalizada', 'dias_atras': 1200},
        {'tipo': 'HEREDOFAMILIARES', 'descripcion': 'Madre con migraña, padre hipertenso', 'dias_atras': 900},
        {'tipo': 'GINECO_OBSTETRICOS', 'descripcion': 'Menarquia a los 12, ciclo regular', 'dias_atras': 700},
    ],
}

REGISTROS_CLINICOS = {
    'laura.garcia@email.com': [
        {'tipo': 'ALERGIA', 'descripcion': 'Alergia al polen y ácaros del polvo', 'dias_atras': 300},
        {'tipo': 'FACTOR_RIESGO', 'descripcion': 'Antecedente de crisis asmáticas recurrentes', 'dias_atras': 150},
    ],
    'roberto.castro@email.com': [
        {'tipo': 'FACTOR_RIESGO', 'descripcion': 'Hipertensión arterial no controlada', 'dias_atras': 200},
    ],
    'carmen.ruiz@email.com': [
        {'tipo': 'ALERGIA', 'descripcion': 'Alergia a penicilina y sus derivados', 'dias_atras': 400},
        {'tipo': 'FACTOR_RIESGO', 'descripcion': 'Diabetes mellitus tipo 2 con mal control glucémico', 'dias_atras': 100},
    ],
    'sofia.vega@email.com': [
        {'tipo': 'FACTOR_RIESGO', 'descripcion': 'Trastorno de ansiedad generalizada en tratamiento', 'dias_atras': 250},
    ],
}

DOCUMENTOS_PACIENTES = {
    'laura.garcia@email.com': [
        {'tipo': 'RESULTADO', 'encabezado': 'Resultados de Espirometría', 'cuerpo': 'Espirometría muestra patrón obstructivo leve. FEV1/FVC = 68%. Se recomienda tratamiento con broncodilatadores.', 'dias_atras': 45},
        {'tipo': 'CONSENTIMIENTO', 'encabezado': 'Consentimiento Informado - Procedimiento', 'cuerpo': 'La paciente Laura García Mendoza autoriza la realización de procedimientos médicos diagnósticos y terapéuticos según indicación facultativa.', 'dias_atras': 60},
    ],
    'roberto.castro@email.com': [
        {'tipo': 'RESULTADO', 'encabezado': 'Resultados de Análisis de Sangre', 'cuerpo': 'Glucosa: 95 mg/dL. Colesterol total: 210 mg/dL. Triglicéridos: 180 mg/dL. Se recomienda control dietético.', 'dias_atras': 30},
    ],
    'carmen.ruiz@email.com': [
        {'tipo': 'RESULTADO', 'encabezado': 'Hemoglobina Glicosilada', 'cuerpo': 'HbA1c: 7.2%. Indica control glucémico moderado. Continuar con metformina y ajustar dieta.', 'dias_atras': 20},
        {'tipo': 'FORMULARIOS', 'encabezado': 'Formulario de Evaluación Nutricional', 'cuerpo': 'Peso: 72 kg. Talla: 1.62 m. IMC: 27.4. Requiere plan de alimentación para diabetes.', 'dias_atras': 25},
    ],
    'diego.morales@email.com': [
        {'tipo': 'CERTIFICADO', 'encabezado': 'Certificado Médico Deportivo', 'cuerpo': 'El paciente Diego Morales Herrera es apto para la práctica de actividad física de alta intensidad.', 'dias_atras': 90},
    ],
    'sofia.vega@email.com': [
        {'tipo': 'FORMULARIOS', 'encabezado': 'Escala de Ansiedad de Hamilton', 'cuerpo': 'Puntaje total: 18. Ansiedad moderada. Se recomienda continuar terapia psicológica y tratamiento farmacológico.', 'dias_atras': 15},
    ],
}

CASOS_PACIENTES = {
    'laura.garcia@email.com': [
        {'estado': 'EN_SEGUIMIENTO', 'prioridad': 'MEDIA', 'dias_apertura': 120},
    ],
    'roberto.castro@email.com': [
        {'estado': 'ABIERTO', 'prioridad': 'ALTA', 'dias_apertura': 30},
    ],
    'carmen.ruiz@email.com': [
        {'estado': 'EN_SEGUIMIENTO', 'prioridad': 'ALTA', 'dias_apertura': 200},
    ],
    'sofia.vega@email.com': [
        {'estado': 'ABIERTO', 'prioridad': 'MEDIA', 'dias_apertura': 60},
        {'estado': 'CERRADO', 'prioridad': 'BAJA', 'dias_apertura': 180, 'dias_cierre': 160},
    ],
}

CITAS_PACIENTES = [
    {'correo': 'laura.garcia@email.com', 'profesional_correo': 'dr.juan@medicampus.com', 'estado': 'ATENDIDA', 'dias_atras': 25, 'hora': '09:00', 'motivo': 'Control de asma', 'servicio': 'Medicina General'},
    {'correo': 'laura.garcia@email.com', 'profesional_correo': 'dr.juan@medicampus.com', 'estado': 'ATENDIDA', 'dias_atras': 10, 'hora': '10:30', 'motivo': 'Revisión de resultados', 'servicio': 'Medicina General'},
    {'correo': 'roberto.castro@email.com', 'profesional_correo': 'dr.juan@medicampus.com', 'estado': 'ATENDIDA', 'dias_atras': 20, 'hora': '11:00', 'motivo': 'Control de presión arterial', 'servicio': 'Cardiología'},
    {'correo': 'carmen.ruiz@email.com', 'profesional_correo': 'dr.juan@medicampus.com', 'estado': 'ATENDIDA', 'dias_atras': 15, 'hora': '08:30', 'motivo': 'Control de diabetes', 'servicio': 'Medicina General'},
    {'correo': 'diego.morales@email.com', 'profesional_correo': 'dr.juan@medicampus.com', 'estado': 'CANCELADA', 'dias_atras': 5, 'hora': '14:00', 'motivo': 'Dolor lumbar', 'servicio': 'Traumatología'},
    {'correo': 'sofia.vega@email.com', 'profesional_correo': 'dra.maria@medicampus.com', 'estado': 'ATENDIDA', 'dias_atras': 12, 'hora': '15:00', 'motivo': 'Sesión de terapia semanal', 'servicio': 'Psicología'},
    {'correo': 'sofia.vega@email.com', 'profesional_correo': 'dra.maria@medicampus.com', 'estado': 'ATENDIDA', 'dias_atras': 5, 'hora': '15:00', 'motivo': 'Sesión de terapia', 'servicio': 'Psicología'},
    {'correo': 'roberto.castro@email.com', 'profesional_correo': 'dr.carlos@medicampus.com', 'estado': 'AGENDADA', 'dias_atras': -3, 'hora': '10:00', 'motivo': 'Revisión dental general', 'servicio': 'Odontología'},
    {'correo': 'laura.garcia@email.com', 'profesional_correo': 'dr.juan@medicampus.com', 'estado': 'CONFIRMADA', 'dias_atras': -7, 'hora': '09:30', 'motivo': 'Control mensual asma', 'servicio': 'Medicina General'},
    {'correo': 'carmen.ruiz@email.com', 'profesional_correo': 'dr.juan@medicampus.com', 'estado': 'AGENDADA', 'dias_atras': -14, 'hora': '11:30', 'motivo': 'Control trimestral diabetes', 'servicio': 'Medicina General'},
    {'correo': 'diego.morales@email.com', 'profesional_correo': 'dr.juan@medicampus.com', 'estado': 'AGENDADA', 'dias_atras': -2, 'hora': '16:00', 'motivo': 'Valoración traumatológica', 'servicio': 'Traumatología'},
    {'correo': 'sofia.vega@email.com', 'profesional_correo': 'dra.maria@medicampus.com', 'estado': 'CONFIRMADA', 'dias_atras': -10, 'hora': '15:00', 'motivo': 'Sesión de terapia', 'servicio': 'Psicología'},
    {'correo': 'roberto.castro@email.com', 'profesional_correo': 'dr.juan@medicampus.com', 'estado': 'NO_ASISTIDA', 'dias_atras': 8, 'hora': '10:00', 'motivo': 'Control cardiovascular', 'servicio': 'Cardiología'},
    {'correo': 'laura.garcia@email.com', 'profesional_correo': 'dr.carlos@medicampus.com', 'estado': 'AGENDADA', 'dias_atras': 0, 'hora': '14:30', 'motivo': 'Limpieza dental', 'servicio': 'Odontología'},
    {'correo': 'carmen.ruiz@email.com', 'profesional_correo': 'ts.ana@medicampus.com', 'estado': 'ATENDIDA', 'dias_atras': 18, 'hora': '09:00', 'motivo': 'Evaluación social', 'servicio': 'Medicina General'},
    {'correo': 'diego.morales@email.com', 'profesional_correo': 'dr.juan@medicampus.com', 'estado': 'CANCELADA', 'dias_atras': 3, 'hora': '08:00', 'motivo': 'Dolor de rodilla', 'servicio': 'Traumatología'},
    {'correo': 'sofia.vega@email.com', 'profesional_correo': 'ts.ana@medicampus.com', 'estado': 'ATENDIDA', 'dias_atras': 7, 'hora': '11:00', 'motivo': 'Evaluación sociofamiliar', 'servicio': 'Medicina General'},
    {'correo': 'laura.garcia@email.com', 'profesional_correo': 'dra.maria@medicampus.com', 'estado': 'ATENDIDA', 'dias_atras': 3, 'hora': '16:30', 'motivo': 'Ansiedad por problemas respiratorios', 'servicio': 'Psicología'},
    {'correo': 'roberto.castro@email.com', 'profesional_correo': 'dr.juan@medicampus.com', 'estado': 'AGENDADA', 'dias_atras': -5, 'hora': '10:30', 'motivo': 'Control mensual hipertensión', 'servicio': 'Cardiología'},
    {'correo': 'carmen.ruiz@email.com', 'profesional_correo': 'dr.carlos@medicampus.com', 'estado': 'AGENDADA', 'dias_atras': -1, 'hora': '12:00', 'motivo': 'Revisión dental', 'servicio': 'Odontología'},
]

DERIVACIONES = [
    {'usuario_correo': 'laura.garcia@email.com', 'remitente_correo': 'dr.juan@medicampus.com', 'destinatario': 'Dr. Vargas - Neumología', 'tipo': 'EXTERNA', 'motivo': 'Paciente requiere evaluación especializada por asma persistente con mal control a pesar de tratamiento', 'dias_atras': 15},
    {'usuario_correo': 'roberto.castro@email.com', 'remitente_correo': 'dr.juan@medicampus.com', 'destinatario': 'Servicio de Cardiología', 'tipo': 'INTERNA', 'motivo': 'Paciente hipertenso con episodios de taquicardia que requieren evaluación cardiológica', 'dias_atras': 10},
    {'usuario_correo': 'carmen.ruiz@email.com', 'remitente_correo': 'dr.juan@medicampus.com', 'destinatario': 'Dra. Morales - Endocrinología', 'tipo': 'EXTERNA', 'motivo': 'Diabetes tipo 2 con descontrol glucémico recurrente, requiere valoración endocrinológica', 'dias_atras': 8},
    {'usuario_correo': 'sofia.vega@email.com', 'remitente_correo': 'dra.maria@medicampus.com', 'destinatario': 'Dr. Paredes - Psiquiatría', 'tipo': 'EXTERNA', 'motivo': 'Paciente con ansiedad generalizada que podría requerir ajuste farmacológico', 'dias_atras': 5, 'estado': 'PENDIENTE'},
    {'usuario_correo': 'laura.garcia@email.com', 'remitente_correo': 'dr.juan@medicampus.com', 'destinatario': 'Servicio de Psicología', 'tipo': 'INTERNA', 'motivo': 'Paciente con síntomas de ansiedad secundarios a su condición respiratoria crónica', 'dias_atras': 20, 'estado': 'ACEPTADA'},
]

NOTIFICACIONES = [
    {'destinatario_correo': 'laura.garcia@email.com', 'tipo': 'CONFIRMACION', 'mensaje': 'Su cita para control de asma ha sido confirmada para el 24 de julio a las 09:30.', 'dias_atras': 1, 'estado': 'no_leido'},
    {'destinatario_correo': 'roberto.castro@email.com', 'tipo': 'CREACION', 'mensaje': 'Se ha agendado una nueva cita de control cardiovascular para el 1 de agosto a las 10:30.', 'dias_atras': 2, 'estado': 'no_leido'},
    {'destinatario_correo': 'carmen.ruiz@email.com', 'tipo': 'CREACION', 'mensaje': 'Su cita de control de diabetes está programada para el 9 de agosto a las 11:30.', 'dias_atras': 3, 'estado': 'leido'},
    {'destinatario_correo': 'dr.juan@medicampus.com', 'tipo': 'DERIVACION', 'mensaje': 'Se ha registrado una nueva derivación para el paciente Roberto Castro al Servicio de Cardiología.', 'dias_atras': 10, 'estado': 'no_leido'},
    {'destinatario_correo': 'sofia.vega@email.com', 'tipo': 'ATENCION', 'mensaje': 'Su consulta de terapia del 21 de julio ha sido registrada. Puede revisar las notas en su historia clínica.', 'dias_atras': 5, 'estado': 'leido'},
    {'destinatario_correo': 'dra.maria@medicampus.com', 'tipo': 'ACTUALIZACION_HISTORIA', 'mensaje': 'Se ha actualizado la historia clínica de la paciente Sofía Vega con nuevos registros.', 'dias_atras': 4, 'estado': 'no_leido'},
]


class Command(BaseCommand):
    help = 'Siembra datos demo completos para el sistema MediCampus en todos los módulos'

    def handle(self, *args, **options):
        Rol = apps.get_model('Seguridad', 'Rol')
        Cuenta = apps.get_model('Seguridad', 'Cuenta')
        Usuario = apps.get_model('Seguridad', 'Usuario')
        Servicio = apps.get_model('Agendas', 'Servicio')
        Cita = apps.get_model('Agendas', 'Cita')
        SignosVitales = apps.get_model('Agendas', 'SignosVitales')
        Derivacion = apps.get_model('Agendas', 'Derivacion')
        HistoriaClinica = apps.get_model('Historias', 'HistoriaClinica')
        Antecedente = apps.get_model('Historias', 'Antecedente')
        Caso = apps.get_model('Historias', 'Caso')
        Documento = apps.get_model('Historias', 'Documento')
        RegistroClinicoHistoria = apps.get_model('Historias', 'RegistroClinicoHistoria')
        Notificacion = apps.get_model('Notificaciones', 'Notificacion')

        with transaction.atomic():
            roles = self._seed_roles(Rol)
            cuenta_admin = self._ensure_admin(Cuenta, Rol)
            servicios_dict = self._seed_servicios(Servicio)
            profesionales = self._seed_profesionales(Cuenta, Usuario, Rol, roles)
            pacientes = self._seed_pacientes(Cuenta, Usuario, Rol, roles)

            all_cuentas = {c.correo: c for c in [cuenta_admin] + profesionales + pacientes}

            historias = self._seed_historias_clinicas(HistoriaClinica, Usuario, pacientes)
            self._seed_antecedentes(Antecedente, historias, pacientes)
            self._seed_registros_clinicos(RegistroClinicoHistoria, historias, pacientes, Usuario, profesionales)
            self._seed_documentos(Documento, historias, pacientes)
            self._seed_casos(Caso, historias, pacientes)
            self._seed_citas(Cita, SignosVitales, servicios_dict, all_cuentas, historias, Usuario)
            self._seed_derivaciones(Derivacion, all_cuentas)
            self._seed_notificaciones(Notificacion, all_cuentas)

        self.stdout.write(self.style.SUCCESS('\n¡Siembra de datos demo completada exitosamente!'))

    def _crear_usuario(self, Cuenta, Usuario, Rol, roles, data):
        cuenta, created = Cuenta.objects.get_or_create(
            correo=data['correo'],
            defaults={'is_active': True},
        )
        if created:
            cuenta.set_password(data['clave'])
            cuenta.roles.add(roles[data['rol']])
            cuenta.save()
        else:
            cuenta.roles.add(roles[data['rol']])
            cuenta.is_active = True
            cuenta.save()
            created = False

        usuario, _ = Usuario.objects.get_or_create(
            cuenta=cuenta,
            defaults={
                'nombres': data['nombres'],
                'apellidos': data['apellidos'],
                'cedula': data['cedula'],
                'fecha_nacimiento': data['fecha_nacimiento'],
                'sexo': data['sexo'],
            },
        )
        return cuenta, usuario

    def _seed_roles(self, Rol):
        roles = {}
        for nombre, desc in ROLES.items():
            rol, created = Rol.objects.get_or_create(
                nombre=nombre,
                defaults={'descripcion': desc},
            )
            roles[nombre] = rol
            if created:
                self.stdout.write(f'  Rol creado: {nombre}')
        return roles

    def _ensure_admin(self, Cuenta, Rol):
        admin, created = Cuenta.objects.get_or_create(
            correo='admin@medicampus.local',
            defaults={'is_active': True, 'is_staff': True, 'is_superuser': True},
        )
        if created:
            admin.set_password('Admin12345.')
            admin.save()
            self.stdout.write('  Superusuario admin creado: admin@medicampus.local / Admin12345.')
        admin.roles.add(Rol.objects.get(nombre='admin'))
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        return admin

    def _seed_servicios(self, Servicio):
        servicios = {}
        for s in SERVICIOS:
            obj, created = Servicio.objects.get_or_create(
                nombre=s['nombre'],
                defaults={'descripcion': s['descripcion'], 'es_activo': True},
            )
            servicios[s['nombre']] = obj
            if created:
                self.stdout.write(f'  Servicio creado: {obj.nombre}')
        return servicios

    def _seed_profesionales(self, Cuenta, Usuario, Rol, roles):
        cuentas = []
        for prof in PROFESIONALES:
            cuenta, usuario = self._crear_usuario(Cuenta, Usuario, Rol, roles, prof)
            cuentas.append(cuenta)
            self.stdout.write(f'  Profesional creado: {prof["nombres"]} {prof["apellidos"]} ({prof["correo"]})')
        return cuentas

    def _seed_pacientes(self, Cuenta, Usuario, Rol, roles):
        cuentas = []
        for pac in PACIENTES:
            cuenta, usuario = self._crear_usuario(Cuenta, Usuario, Rol, roles, pac)
            cuentas.append(cuenta)
            self.stdout.write(f'  Paciente creado: {pac["nombres"]} {pac["apellidos"]} ({pac["correo"]})')
        return cuentas

    def _seed_historias_clinicas(self, HistoriaClinica, Usuario, pacientes):
        historias = {}
        for pac in pacientes:
            usuario = Usuario.objects.get(cuenta=pac)
            hc, created = HistoriaClinica.objects.get_or_create(
                usuario=usuario,
                defaults={
                    'alergia': 'Ninguna conocida',
                    'condicion_preexistente': 'Ninguna',
                    'factor_riesgo': 'Ninguno',
                },
            )
            if not created:
                hc.alergia = 'Ninguna conocida'
                hc.condicion_preexistente = 'Ninguna'
                hc.factor_riesgo = 'Ninguno'
                hc.save()
            historias[pac.correo] = hc
            self.stdout.write(f'  Historia clínica creada para {pac.correo}')
        return historias

    def _seed_antecedentes(self, Antecedente, historias, pacientes):
        now = timezone.now().date()
        for pac in pacientes:
            hc = historias[pac.correo]
            for ant in ANTECEDENTES_PACIENTES.get(pac.correo, []):
                fecha = now - timedelta(days=ant['dias_atras'])
                ante, created = Antecedente.objects.get_or_create(
                    historia_clinica=hc,
                    tipo_antecedente=ant['tipo'],
                    fecha=fecha,
                    defaults={'descripcion': ant['descripcion']},
                )
                if created:
                    self.stdout.write(f'    Antecedente {ant["tipo"]} para {pac.correo}')

    def _seed_registros_clinicos(self, RegistroClinicoHistoria, historias, pacientes, Usuario, profesionales):
        now = timezone.now()
        for pac in pacientes:
            hc = historias[pac.correo]
            for reg in REGISTROS_CLINICOS.get(pac.correo, []):
                fecha = now - timedelta(days=reg['dias_atras'])
                medico = None
                if profesionales:
                    medico = Usuario.objects.filter(cuenta=profesionales[0]).first()
                reg_obj, created = RegistroClinicoHistoria.objects.get_or_create(
                    historia_clinica=hc,
                    tipo=reg['tipo'],
                    descripcion=reg['descripcion'],
                    defaults={
                        'fecha_registro': fecha,
                        'medico_registro': medico,
                        'activo': True,
                    },
                )
                if created:
                    self.stdout.write(f'    Registro clínico {reg["tipo"]} para {pac.correo}')

    def _seed_documentos(self, Documento, historias, pacientes):
        now = timezone.now().date()
        for pac in pacientes:
            hc = historias[pac.correo]
            for doc in DOCUMENTOS_PACIENTES.get(pac.correo, []):
                fecha = now - timedelta(days=doc['dias_atras'])
                doc_obj, created = Documento.objects.get_or_create(
                    historia_clinica=hc,
                    tipo_documento=doc['tipo'],
                    encabezado=doc['encabezado'],
                    defaults={
                        'cuerpo': doc['cuerpo'],
                        'fecha': fecha,
                    },
                )
                if created:
                    self.stdout.write(f'    Documento {doc["tipo"]} para {pac.correo}')

    def _seed_casos(self, Caso, historias, pacientes):
        now = timezone.now().date()
        for pac in pacientes:
            hc = historias[pac.correo]
            for caso_data in CASOS_PACIENTES.get(pac.correo, []):
                fecha_apertura = now - timedelta(days=caso_data['dias_apertura'])
                fecha_cierre = None
                if caso_data.get('dias_cierre'):
                    fecha_cierre = now - timedelta(days=caso_data['dias_cierre'])
                caso, created = Caso.objects.get_or_create(
                    historia_clinica=hc,
                    fecha_apertura=fecha_apertura,
                    defaults={
                        'fecha_cierre': fecha_cierre,
                        'estado_caso': caso_data['estado'],
                        'prioridad': caso_data['prioridad'],
                    },
                )
                if created:
                    self.stdout.write(f'    Caso {caso_data["estado"]} para {pac.correo}')

    def _seed_citas(self, Cita, SignosVitales, servicios_dict, all_cuentas, historias, Usuario):
        now = timezone.now()
        consulta_models = {
            'ConsultaMedica': apps.get_model('Agendas', 'ConsultaMedica'),
            'ConsultaPsicologica': apps.get_model('Agendas', 'ConsultaPsicologica'),
            'ConsultaOdontologica': apps.get_model('Agendas', 'ConsultaOdontologica'),
            'ConsultaSocial': apps.get_model('Agendas', 'ConsultaSocial'),
        }

        for cita_data in CITAS_PACIENTES:
            if cita_data['dias_atras'] >= 0:
                fecha = now - timedelta(days=cita_data['dias_atras'])
            else:
                fecha = now + timedelta(days=abs(cita_data['dias_atras']))

            hora_parts = cita_data['hora'].split(':')
            fecha = fecha.replace(hour=int(hora_parts[0]), minute=int(hora_parts[1]), second=0, microsecond=0)

            paciente_cuenta = all_cuentas.get(cita_data['correo'])
            profesional_cuenta = all_cuentas.get(cita_data['profesional_correo'])

            if not paciente_cuenta or not profesional_cuenta:
                continue

            cita, created = Cita.objects.get_or_create(
                usuario_id=paciente_cuenta.id,
                profesional_id=profesional_cuenta.id,
                fecha_hora=fecha,
                estado=cita_data['estado'],
                motivo=cita_data['motivo'],
            )

            servicio = servicios_dict.get(cita_data['servicio'])
            if servicio:
                cita.servicios.add(servicio)

            if created:
                self.stdout.write(f'  Cita {cita_data["estado"]} para {cita_data["correo"]} ({fecha.date()})')

            if cita_data['estado'] == 'ATENDIDA' and created:
                if cita_data['profesional_correo'] == 'ts.ana@medicampus.com':
                    tipo_consulta = ('ConsultaSocial', {'nivel_socioeconomico': 'Medio', 'descripcion_vivienda': 'Vivienda propia en zona urbana, servicios básicos completos'})
                else:
                    sv = SignosVitales.objects.create(
                        peso_kg=Decimal('70.0'),
                        temperatura=Decimal('36.5'),
                        presion_arterial='120/80',
                        frecuencia_cardiaca=72,
                    )
                    tipo = cita_data['servicio']
                    tipo_consulta = {
                        'Cardiología': ('ConsultaMedica', {'anamnesis': 'Paciente refiere dolor torácico ocasional', 'tratamiento': 'Reposo y medicación cardíaca', 'diagnostico': 'I10', 'signos_vitales': sv}),
                        'Neurología': ('ConsultaMedica', {'anamnesis': 'Paciente refiere cefalea frecuente', 'tratamiento': 'Analgésicos y reposo', 'diagnostico': 'G43', 'signos_vitales': sv}),
                        'Pediatría': ('ConsultaMedica', {'anamnesis': 'Paciente pediátrico en control de rutina', 'tratamiento': 'Vitaminas', 'diagnostico': 'Z00', 'signos_vitales': sv}),
                        'Medicina General': ('ConsultaMedica', {'anamnesis': 'Paciente en control general', 'tratamiento': 'Tratamiento sintomático', 'diagnostico': 'Z00', 'signos_vitales': sv}),
                        'Traumatología': ('ConsultaMedica', {'anamnesis': 'Paciente refiere dolor lumbar', 'tratamiento': 'Antiinflamatorios y fisioterapia', 'diagnostico': 'M54', 'signos_vitales': sv}),
                        'Psicología': ('ConsultaPsicologica', {'notas_evolucion': 'Paciente muestra evolución favorable', 'estado_humor': 'Estable', 'nivel_ansiedad': 3, 'nivel_autoestima': 4, 'diagnostico': 'F41'}),
                        'Odontología': ('ConsultaOdontologica', {'odontograma': 'Sin hallazgos patológicos', 'procedimientos': 'Limpieza dental y revisión'}),
                    }.get(tipo, ('ConsultaMedica', {'anamnesis': 'Consulta de rutina', 'tratamiento': 'Observación', 'diagnostico': 'Z00', 'signos_vitales': sv}))

                modelo = consulta_models[tipo_consulta[0]]
                extra = tipo_consulta[1].copy()
                if 'signos_vitales' in extra:
                    extra['signos_vitales'] = sv

                hc_id = historias[cita_data["correo"]].id
                modelo.objects.create(
                    cita=cita,
                    historia_clinica_id=hc_id,
                    observaciones=f'Observaciones de {cita_data["motivo"]}',
                    **extra,
                )
                self.stdout.write(f'    {tipo_consulta[0]} registrada para cita de {cita_data["correo"]}')

    def _seed_derivaciones(self, Derivacion, all_cuentas):
        for der in DERIVACIONES:
            usuario = all_cuentas.get(der['usuario_correo'])
            remitente = all_cuentas.get(der['remitente_correo'])
            if not usuario or not remitente:
                continue
            now = timezone.now()
            fecha = now - timedelta(days=der['dias_atras'])
            estado = der.get('estado', 'ACEPTADA')
            derivacion, created = Derivacion.objects.get_or_create(
                usuario_id=usuario.id,
                remitente_id=remitente.id,
                destinatario=der['destinatario'],
                tipo=der['tipo'],
                defaults={
                    'motivo': der['motivo'],
                    'estado': estado,
                    'fecha_creacion': fecha,
                },
            )
            if created:
                self.stdout.write(f'  Derivación {der["tipo"]} para {der["usuario_correo"]}')

    def _seed_notificaciones(self, Notificacion, all_cuentas):
        for notif in NOTIFICACIONES:
            destinatario = all_cuentas.get(notif['destinatario_correo'])
            if not destinatario:
                continue
            now = timezone.now()
            fecha = now - timedelta(days=notif['dias_atras'])
            notif_obj, created = Notificacion.objects.get_or_create(
                usuario_destinatario=destinatario,
                tipo=notif['tipo'],
                mensaje=notif['mensaje'],
                defaults={
                    'estado': notif['estado'],
                    'fecha_creacion': fecha,
                    'origen_evento': 'seed_all',
                    'detalles': {'origen': 'seed_demo'},
                    'usuario_creacion': destinatario,
                },
            )
            if created:
                self.stdout.write(f'  Notificación {notif["tipo"]} para {notif["destinatario_correo"]}')
