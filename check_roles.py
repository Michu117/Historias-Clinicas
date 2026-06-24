import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'HistoriasClinicas.settings')
django.setup()
from Seguridad.models import Cuenta
for c in Cuenta.objects.all():
    roles = list(c.roles.values_list('nombre', flat=True))
    profile = hasattr(c, 'perfil') and c.perfil is not None
    print(f"{c.correo}: roles={roles}, profile={profile}")
