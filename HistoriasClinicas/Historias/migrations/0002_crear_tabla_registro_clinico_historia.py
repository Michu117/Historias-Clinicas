from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Historias', '0001_initial'),
        ('Seguridad', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='RegistroClinicoHistoria',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='creado en')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='actualizado en')),
                ('tipo', models.CharField(
                    choices=[
                        ('ALERGIA', 'Alergia'),
                        ('FACTOR_RIESGO', 'Factor de riesgo')
                    ],
                    max_length=20,
                    verbose_name='tipo'
                )),
                ('descripcion', models.TextField(verbose_name='descripción')),
                ('fecha_registro', models.DateTimeField(auto_now_add=True, verbose_name='fecha de registro')),
                ('activo', models.BooleanField(default=True, verbose_name='activo')),
                ('historia_clinica', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='registros_clinicos',
                    to='Historias.historiaclinica',
                    verbose_name='historia clínica'
                )),
                ('medico_registro', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='registros_creados',
                    to='Seguridad.usuario',
                    verbose_name='médico que registró'
                )),
            ],
            options={
                'verbose_name': 'registro clínico',
                'verbose_name_plural': 'registros clínicos',
                'ordering': ('-fecha_registro',),
            },
        ),
    ]