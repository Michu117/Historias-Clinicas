from django.contrib import admin

from .models import Bitacora, Cuenta, Rol, Usuario


@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'descripcion')
    search_fields = ('nombre',)


@admin.register(Cuenta)
class CuentaAdmin(admin.ModelAdmin):
    list_display = ('id', 'correo', 'rol', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('correo',)
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'rol')


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'cuenta', 'nombre_completo', 'cedula', 'sexo')
    search_fields = ('cuenta__correo', 'cedula', 'nombres', 'apellidos')


@admin.register(Bitacora)
class BitacoraAdmin(admin.ModelAdmin):
    list_display = ('id', 'fecha_hora', 'cuenta', 'tipo_accion', 'modulo_afectado')
    search_fields = ('cuenta__correo', 'tipo_accion', 'modulo_afectado')
    list_filter = ('tipo_accion', 'modulo_afectado')
