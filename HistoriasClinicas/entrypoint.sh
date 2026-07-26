#!/bin/bash
set -e

echo "=== MediCampus Backend Entrypoint ==="

echo "[1/5] Ejecutando migraciones..."
python manage.py migrate --noinput

echo "[2/5] Recopilando archivos estáticos..."
python manage.py collectstatic --noinput 2>&1

echo "[3/5] Configurando datos iniciales..."

python manage.py shell -c "
from django.contrib.auth import get_user_model
from Seguridad.models import Rol
Cuenta = get_user_model()
admin, created = Cuenta.objects.get_or_create(
    correo='admin@medicampus.local',
    defaults={'is_active': True, 'is_staff': True, 'is_superuser': True},
)
if created:
    admin.set_password('Admin12345.')
    admin.save()
    print('  Superusuario admin creado: admin@medicampus.local / Admin12345.')
else:
    print('  Superusuario admin ya existe.')
    admin.is_staff = True
    admin.is_superuser = True
    admin.save()
admin_rol, _ = Rol.objects.get_or_create(nombre='admin', defaults={'descripcion': 'Administrador del sistema'})
admin.roles.add(admin_rol)
print('  Rol admin asignado.')
"

if [ "${DJANGO_SEED_DATA}" = "true" ]; then
    echo "[4/5] Sembrando datos sintéticos..."

    python manage.py seed_profesionales 2>&1
    python manage.py seed_agenda_demo 2>&1
    python manage.py seed_demo_data 2>&1

    echo "  Seed de datos completado."
else
    echo "[4/5] Seed de datos omitido (DJANGO_SEED_DATA != true)"
fi

echo "[5/5] Iniciando servidor Gunicorn..."
exec gunicorn HistoriasClinicas.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
