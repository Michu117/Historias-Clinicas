from django.db import migrations


def seed_servicios(apps, schema_editor):
    Servicio = apps.get_model('Agendas', 'Servicio')
    servicios = [
        {'nombre': 'Medicina', 'descripcion': 'Atención médica general'},
        {'nombre': 'Odontologia', 'descripcion': 'Atención odontológica'},
        {'nombre': 'Trabajo Social', 'descripcion': 'Atención de trabajo social'},
        {'nombre': 'Psicologia', 'descripcion': 'Atención psicológica'},
    ]
    for s in servicios:
        Servicio.objects.get_or_create(nombre=s['nombre'], defaults=s)


class Migration(migrations.Migration):

    dependencies = [
        ('Agendas', '0002_rename_activo_servicio_es_activo'),
    ]

    operations = [
        migrations.RunPython(seed_servicios, reverse_code=migrations.RunPython.noop),
    ]
