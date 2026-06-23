from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Bitacora, Cuenta, Rol, Usuario
from .services import crear_rol, crear_usuario, actualizar_perfil_usuario, autenticar_cuenta


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ('id', 'nombre', 'descripcion')


class RoleCreateSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=80)
    descripcion = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate_nombre(self, value):
        if Rol.objects.filter(nombre__iexact=value).exists():
            raise serializers.ValidationError('Ya existe un rol con ese nombre.')
        return value

    def create(self, validated_data):
        return crear_rol(
            nombre=validated_data['nombre'],
            descripcion=validated_data.get('descripcion', ''),
        )


class UsuarioSerializer(serializers.ModelSerializer):
    fechaNacimiento = serializers.DateField(source='fecha_nacimiento')
    nombre = serializers.CharField(source='nombres')
    apellido = serializers.CharField(source='apellidos')

    class Meta:
        model = Usuario
        fields = ('nombre', 'apellido', 'cedula', 'fechaNacimiento', 'sexo')


class CuentaSerializer(serializers.ModelSerializer):
    esActiva = serializers.BooleanField(source='is_active')
    usuario = UsuarioSerializer(source='perfil', read_only=True)
    roles = RolSerializer(many=True, read_only=True)

    class Meta:
        model = Cuenta
        fields = ('id', 'correo', 'esActiva', 'roles', 'usuario')


class CuentaSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuenta
        fields = ('id', 'correo')


class TokenPairSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()


class AuthResponseSerializer(serializers.Serializer):
    usuario = CuentaSerializer()
    tokens = TokenPairSerializer()


class RegistroSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    clave = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)
    nombre = serializers.CharField(max_length=120)
    apellido = serializers.CharField(max_length=120)
    cedula = serializers.CharField(max_length=20)
    fechaNacimiento = serializers.DateField()
    sexo = serializers.ChoiceField(choices=Usuario.Sexo.choices)
    roles = serializers.ListField(
        child=serializers.CharField(max_length=80),
        required=False,
        default=['usuario'],
    )

    def validate_correo(self, value):
        if Cuenta.objects.filter(correo__iexact=value).exists():
            raise serializers.ValidationError('Ya existe una cuenta con ese correo.')
        return value

    def validate_cedula(self, value):
        if Usuario.objects.filter(cedula=value).exists():
            raise serializers.ValidationError('Ya existe un usuario con esa cédula.')
        return value

    def validate_clave(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        roles_nombre = validated_data.pop('roles', None) or ['usuario']
        return crear_usuario(
            correo=validated_data['correo'],
            clave=validated_data['clave'],
            nombre=validated_data['nombre'],
            apellido=validated_data['apellido'],
            cedula=validated_data['cedula'],
            fecha_nacimiento=validated_data['fechaNacimiento'],
            sexo=validated_data['sexo'],
            roles_nombre=roles_nombre,
        )


class LoginSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    clave = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        correo = attrs.get('correo')
        clave = attrs.get('clave')
        user = autenticar_cuenta(request=self.context.get('request'), correo=correo, clave=clave)
        if not user:
            raise serializers.ValidationError('Credenciales inválidas.')
        if not user.is_active:
            raise serializers.ValidationError('La cuenta está inactiva.')
        attrs['user'] = user
        return attrs


class BitacoraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bitacora
        fields = ('fecha_hora', 'tipo_accion', 'modulo_afectado', 'detalle')


class BitacoraListSerializer(serializers.ModelSerializer):
    correo = serializers.CharField(source='cuenta.correo', read_only=True)
    tipoAccion = serializers.CharField(source='get_tipo_accion_display', read_only=True)
    fechaHora = serializers.DateTimeField(source='fecha_hora', read_only=True)
    moduloAfectado = serializers.CharField(source='modulo_afectado', read_only=True)
    direccionIp = serializers.CharField(source='direccion_ip', read_only=True)

    class Meta:
        model = Bitacora
        fields = ('id', 'fechaHora', 'tipoAccion', 'moduloAfectado', 'correo', 'detalle', 'direccionIp')


class UserListSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(source='perfil', read_only=True)
    roles = RolSerializer(many=True, read_only=True)
    esActiva = serializers.BooleanField(source='is_active')

    class Meta:
        model = Cuenta
        fields = ('id', 'correo', 'esActiva', 'roles', 'usuario')


class UserCreateSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    clave = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)
    nombre = serializers.CharField(max_length=120)
    apellido = serializers.CharField(max_length=120)
    cedula = serializers.CharField(max_length=20)
    fechaNacimiento = serializers.DateField()
    sexo = serializers.ChoiceField(choices=Usuario.Sexo.choices)
    roles = serializers.ListField(
        child=serializers.CharField(max_length=80),
        required=False,
        default=['usuario'],
    )

    def validate_correo(self, value):
        if Cuenta.objects.filter(correo__iexact=value).exists():
            raise serializers.ValidationError('Ya existe una cuenta con ese correo.')
        return value

    def validate_cedula(self, value):
        if Usuario.objects.filter(cedula=value).exists():
            raise serializers.ValidationError('Ya existe un usuario con esa cédula.')
        return value

    def validate_clave(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        roles_nombre = validated_data.pop('roles', None) or ['usuario']
        return crear_usuario(
            correo=validated_data['correo'],
            clave=validated_data['clave'],
            nombre=validated_data['nombre'],
            apellido=validated_data['apellido'],
            cedula=validated_data['cedula'],
            fecha_nacimiento=validated_data['fechaNacimiento'],
            sexo=validated_data['sexo'],
            roles_nombre=roles_nombre,
        )


class UserUpdateSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=120, required=False)
    apellido = serializers.CharField(max_length=120, required=False)
    sexo = serializers.ChoiceField(choices=Usuario.Sexo.choices, required=False)
    esActiva = serializers.BooleanField(source='is_active', required=False)

    def update(self, instance, validated_data):
        cuenta = actualizar_perfil_usuario(instance, validated_data)
        if 'is_active' in validated_data:
            cuenta.is_active = validated_data['is_active']
            cuenta.save()
        return cuenta
