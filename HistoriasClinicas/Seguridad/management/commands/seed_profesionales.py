from django.core.management.base import BaseCommand
from django.apps import apps


class Command(BaseCommand):
    help = 'Siembra roles y cuentas de profesionales de prueba'

    def handle(self, *args, **options):
        Rol = apps.get_model('Seguridad', 'Rol')
        Cuenta = apps.get_model('Seguridad', 'Cuenta')
        Usuario = apps.get_model('Seguridad', 'Usuario')

        roles_data = {
            'admin': 'Administrador del sistema',
            'medico': 'Médico profesional',
            'psicologo': 'Psicólogo profesional',
            'odontologo': 'Odontólogo profesional',
            'trabajador_social': 'Trabajador Social profesional',
            'paciente': 'Paciente',
            'estudiante': 'Estudiante',
        }

        created_roles = {}
        for nombre, desc in roles_data.items():
            rol, created = Rol.objects.get_or_create(
                nombre=nombre,
                defaults={'descripcion': desc},
            )
            created_roles[nombre] = rol
            if created:
                self.stdout.write(f'  Rol creado: {nombre}')

        profesionales = [
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
        ]

        for prof in profesionales:
            cuenta, created = Cuenta.objects.get_or_create(
                correo=prof['correo'],
                defaults={
                    'rol': created_roles[prof['rol']],
                    'is_active': True,
                },
            )
            if created:
                cuenta.set_password(prof['clave'])
                cuenta.save()

                Usuario.objects.get_or_create(
                    cuenta=cuenta,
                    defaults={
                        'nombres': prof['nombres'],
                        'apellidos': prof['apellidos'],
                        'cedula': prof['cedula'],
                        'fecha_nacimiento': prof['fecha_nacimiento'],
                        'sexo': prof['sexo'],
                    },
                )
                self.stdout.write(self.style.SUCCESS(
                    f'  Profesional creado: {prof["nombres"]} {prof["apellidos"]} '
                    f'({prof["correo"]}) como {prof["rol"]}'
                ))
            else:
                self.stdout.write(f'  Ya existe: {prof["correo"]}')

        self.stdout.write(self.style.SUCCESS('\nSiembra de profesionales completada.'))
