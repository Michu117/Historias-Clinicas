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
Cuenta = get_user_model()
if not Cuenta.objects.filter(correo='admin@medicampus.local').exists():
    admin = Cuenta.objects.create_superuser(
        correo='admin@medicampus.local',
        password='Admin12345.',
        is_active=True,
    )
    print('  Superusuario admin creado: admin@medicampus.local / Admin12345.')
else:
    print('  Superusuario admin ya existe.')
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
