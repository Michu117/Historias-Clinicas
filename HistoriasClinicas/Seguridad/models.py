from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models


class Rol(models.Model):
    nombre = models.CharField(max_length=80, unique=True)
    descripcion = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'

    def __str__(self) -> str:
        return self.nombre


class CuentaManager(BaseUserManager):
    def create_user(self, correo, password=None, **extra_fields):
        if not correo:
            raise ValueError('El correo es obligatorio.')
        correo = self.normalize_email(correo)
        user = self.model(correo=correo, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, correo, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(correo, password, **extra_fields)


class Cuenta(AbstractBaseUser, PermissionsMixin):
    correo = models.EmailField(unique=True)
    roles = models.ManyToManyField(Rol, blank=True, related_name='cuentas')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    must_change_password = models.BooleanField(default=False)

    objects = CuentaManager()

    USERNAME_FIELD = 'correo'
    EMAIL_FIELD = 'correo'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'Cuenta'
        verbose_name_plural = 'Cuentas'

    def __str__(self) -> str:
        return self.correo


class Usuario(models.Model):
    class Sexo(models.TextChoices):
        HOMBRE = 'H', 'Hombre'
        MUJER = 'M', 'Mujer'

    cuenta = models.OneToOneField(Cuenta, on_delete=models.CASCADE, related_name='perfil')
    nombres = models.CharField(max_length=120)
    apellidos = models.CharField(max_length=120)
    cedula = models.CharField(max_length=20, unique=True)
    fecha_nacimiento = models.DateField()
    sexo = models.CharField(max_length=1, choices=Sexo.choices)

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self) -> str:
        return self.nombre_completo

    @property
    def nombre_completo(self) -> str:
        return f'{self.nombres} {self.apellidos}'.strip()


class Bitacora(models.Model):
    class TipoAccion(models.TextChoices):
        REGISTRO = 'registro', 'Registro'
        INICIO_SESION = 'inicio_sesion', 'Inicio de sesión'
        INICIO_SESION_FALLIDO = 'inicio_sesion_fallido', 'Inicio de sesión fallido'
        REFRESCO_TOKEN = 'refresco_token', 'Refresco de token'
        ACCESO = 'acceso', 'Acceso'
        CAMBIO_ROL = 'cambio_rol', 'Cambio de rol'

    fecha_hora = models.DateTimeField(auto_now_add=True)
    tipo_accion = models.CharField(max_length=50, choices=TipoAccion.choices)
    modulo_afectado = models.CharField(max_length=100)
    cuenta = models.ForeignKey(Cuenta, on_delete=models.CASCADE, related_name='bitacoras')
    detalle = models.TextField(blank=True)
    direccion_ip = models.GenericIPAddressField(blank=True, null=True)

    class Meta:
        verbose_name = 'Bitácora'
        verbose_name_plural = 'Bitácoras'
        ordering = ('-fecha_hora',)

    def __str__(self) -> str:
        return f'{self.fecha_hora:%Y-%m-%d %H:%M:%S} - {self.tipo_accion}'
