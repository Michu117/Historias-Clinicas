from django.db import migrations, models


def migrar_rol_fk_a_m2m(apps, schema_editor):
    Cuenta = apps.get_model('Seguridad', 'Cuenta')
    for cuenta in Cuenta.objects.iterator():
        try:
            old_rol_id = cuenta.rol_id
        except AttributeError:
            old_rol_id = None
        if old_rol_id is not None:
            cuenta.roles.add(old_rol_id)


class Migration(migrations.Migration):

    dependencies = [
        ('Seguridad', '0002_bitacora_add_ip'),
    ]

    operations = [
        migrations.AddField(
            model_name='cuenta',
            name='roles',
            field=models.ManyToManyField(blank=True, related_name='cuentas', to='Seguridad.rol'),
        ),
        migrations.RunPython(migrar_rol_fk_a_m2m, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='cuenta',
            name='rol',
        ),
    ]
