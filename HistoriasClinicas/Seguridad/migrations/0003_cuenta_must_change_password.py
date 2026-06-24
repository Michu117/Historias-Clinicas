from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Seguridad', '0002_bitacora_add_ip'),
    ]

    operations = [
        migrations.AddField(
            model_name='cuenta',
            name='must_change_password',
            field=models.BooleanField(default=False),
        ),
    ]
