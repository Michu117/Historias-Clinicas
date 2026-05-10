# Generated migration to preload roles

from django.db import migrations


def preload_roles(apps, schema_editor):
    Rol = apps.get_model('authentication', 'Rol')
    
    roles_data = [
        {'nombre': 'admin', 'descripcion': 'Administrador del sistema con acceso total'},
        {'nombre': 'medico', 'descripcion': 'Profesional médico con acceso a información clínica'},
        {'nombre': 'psicologo', 'descripcion': 'Profesional psicólogo con acceso a registros psicológicos'},
        {'nombre': 'estudiante', 'descripcion': 'Estudiante con acceso limitado a su propia información'},
    ]
    
    for rol_data in roles_data:
        Rol.objects.get_or_create(
            nombre=rol_data['nombre'],
            defaults={'descripcion': rol_data['descripcion']}
        )


def reverse_roles(apps, schema_editor):
    Rol = apps.get_model('authentication', 'Rol')
    Rol.objects.filter(nombre__in=['admin', 'medico', 'psicologo', 'estudiante']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0002_alter_usuario_sexo'),
    ]

    operations = [
        migrations.RunPython(preload_roles, reverse_roles),
    ]
