from django.core.management.base import BaseCommand
from django.db import transaction
from Seguridad.models import Cuenta, Rol, Usuario
from Agendas.models import Servicio


class Command(BaseCommand):
    help = 'Crea datos de prueba para agenda (paciente, profesional, servicio)'

    DEMO_USERS = {
        'paciente': {
            'correo': 'paciente.demo@medicampus.local',
            'clave': 'Paciente12345.',
            'nombres': 'Paciente',
            'apellidos': 'Demo',
            'cedula': '0000000002',
            'fecha_nacimiento': '2001-01-01',
            'sexo': 'H',
            'rol_nombre': 'paciente',
        },
        'profesional': {
            'correo': 'profesional.demo@medicampus.local',
            'clave': 'Profesional12345.',
            'nombres': 'Profesional',
            'apellidos': 'Demo',
            'cedula': '0000000003',
            'fecha_nacimiento': '1990-01-01',
            'sexo': 'M',
            'rol_nombre': 'psicologo',
        },
        'medico': {
            'correo': 'medico.demo@medicampus.local',
            'clave': 'Medico12345.',
            'nombres': 'Medico',
            'apellidos': 'Demo',
            'cedula': '0000000004',
            'fecha_nacimiento': '1988-01-01',
            'sexo': 'H',
            'rol_nombre': 'medico',
        },
    }

    def handle(self, *args, **options):
        with transaction.atomic():
            self._crear_roles()
            self._crear_servicios()
            for key, data in self.DEMO_USERS.items():
                self._crear_usuario(key, data)

        self.stdout.write(self.style.SUCCESS('\nDatos demo de agenda creados exitosamente.'))

    def _crear_roles(self):
        roles_needed = {d['rol_nombre'] for d in self.DEMO_USERS.values()}
        for nombre in roles_needed:
            rol, created = Rol.objects.get_or_create(
                nombre=nombre,
                defaults={'descripcion': f'Rol {nombre} del sistema'},
            )
            if created:
                self.stdout.write(f'  Rol creado: {nombre}')

    def _crear_servicios(self):
        servicios = [
            {'nombre': 'Psicología', 'descripcion': 'Atención psicológica'},
            {'nombre': 'Medicina General', 'descripcion': 'Atención médica general'},
        ]
        for s in servicios:
            servicio, created = Servicio.objects.get_or_create(
                nombre=s['nombre'],
                defaults={'descripcion': s['descripcion'], 'es_activo': True},
            )
            if not created and not servicio.es_activo:
                servicio.es_activo = True
                servicio.save()
                self.stdout.write(f'  Servicio activado: {s["nombre"]}')
            elif created:
                self.stdout.write(f'  Servicio creado: {s["nombre"]}')

    def _crear_usuario(self, key, data):
        rol = Rol.objects.get(nombre=data['rol_nombre'])

        cuenta, created = Cuenta.objects.get_or_create(
            correo=data['correo'],
            defaults={
                'is_active': True,
                'is_staff': False,
                'is_superuser': False,
            },
        )

        if created:
            cuenta.set_password(data['clave'])
            cuenta.roles.add(rol)
            cuenta.save()
        else:
            cuenta.roles.add(rol)
            cuenta.is_active = True
            cuenta.save()

        usuario, usuario_created = Usuario.objects.get_or_create(
            cuenta=cuenta,
            defaults={
                'nombres': data['nombres'],
                'apellidos': data['apellidos'],
                'cedula': data['cedula'],
                'fecha_nacimiento': data['fecha_nacimiento'],
                'sexo': data['sexo'],
            },
        )

        if not usuario_created:
            for field in ('nombres', 'apellidos', 'cedula', 'fecha_nacimiento', 'sexo'):
                setattr(usuario, field, data[field])
            usuario.save()

        status = 'actualizado' if not created else 'creado'
        self.stdout.write(self.style.SUCCESS(
            f'  {key.capitalize()} {status}: {data["correo"]} / {data["clave"]}'
        ))
