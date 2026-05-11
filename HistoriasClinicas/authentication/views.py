from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema

from .models import Bitacora, Cuenta, Rol, Usuario
from .permissions import IsAdmin, IsOwnerOrAdmin
from .serializers import (
    AuthResponseSerializer,
    BitacoraListSerializer,
    CuentaSerializer,
    LoginSerializer,
    RegistroSerializer,
    RoleCreateSerializer,
    RolSerializer,
    TokenPairSerializer,
    UserCreateSerializer,
    UserListSerializer,
    UserUpdateSerializer,
)


def generar_tokens(cuenta: Cuenta) -> dict[str, str]:
    refresh = RefreshToken.for_user(cuenta)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegistroView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id='auth_register',
        summary='Registrar una nueva cuenta',
        request=RegistroSerializer,
        responses={
            201: OpenApiResponse(response=AuthResponseSerializer, description='Cuenta registrada correctamente.'),
            400: OpenApiResponse(description='Datos inválidos o duplicados.'),
        },
        examples=[
            OpenApiExample(
                'Registro exitoso',
                value={
                    'correo': 'ana@example.com',
                    'clave': 'ClaveSegura123',
                    'nombre': 'Ana',
                    'apellido': 'Perez',
                    'cedula': '0102030405',
                    'fechaNacimiento': '1990-05-20',
                    'sexo': 'F',
                    'rol': 'medico',
                },
                request_only=True,
            )
        ],
    )
    def post(self, request):
        serializer = RegistroSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        cuenta = serializer.save()
        Bitacora.objects.create(
            cuenta=cuenta,
            tipo_accion=Bitacora.TipoAccion.REGISTRO,
            modulo_afectado='autenticacion',
            detalle='Registro de cuenta exitoso.',
        )
        return Response(
            {
                'usuario': CuentaSerializer(cuenta).data,
                'tokens': generar_tokens(cuenta),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id='auth_login',
        summary='Iniciar sesión con correo y contraseña',
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(response=AuthResponseSerializer, description='Autenticación correcta.'),
            400: OpenApiResponse(description='Credenciales inválidas.'),
        },
        examples=[
            OpenApiExample(
                'Login exitoso',
                value={
                    'correo': 'ana@example.com',
                    'clave': 'ClaveSegura123',
                },
                request_only=True,
            )
        ],
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        
        # Intentar autenticar
        correo = request.data.get('correo')
        try:
            cuenta = Cuenta.objects.get(correo__iexact=correo)
        except Cuenta.DoesNotExist:
            cuenta = None
        
        if not serializer.is_valid():
            # Registrar intento fallido
            if cuenta:
                Bitacora.objects.create(
                    cuenta=cuenta,
                    tipo_accion=Bitacora.TipoAccion.INICIO_SESION_FALLIDO,
                    modulo_afectado='autenticacion',
                    detalle='Intento de inicio de sesión fallido.',
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        cuenta = serializer.validated_data['user']
        Bitacora.objects.create(
            cuenta=cuenta,
            tipo_accion=Bitacora.TipoAccion.INICIO_SESION,
            modulo_afectado='autenticacion',
            detalle='Inicio de sesión exitoso.',
        )
        return Response(
            {
                'usuario': CuentaSerializer(cuenta).data,
                'tokens': generar_tokens(cuenta),
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id='auth_me',
        summary='Obtener la cuenta autenticada',
        responses={200: CuentaSerializer},
        tags=['auth'],
    )
    def get(self, request):
        return Response(CuentaSerializer(request.user).data)


class RefreshView(TokenRefreshView):
    permission_classes = [AllowAny]
    serializer_class = TokenRefreshSerializer

    @extend_schema(
        operation_id='auth_refresh',
        summary='Renovar el access token usando un refresh token',
        request=TokenRefreshSerializer,
        responses={200: OpenApiResponse(response=TokenPairSerializer, description='Nuevo token emitido.')},
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            cuenta_id = token.get('user_id')
            if cuenta_id:
                cuenta = get_object_or_404(Cuenta, pk=cuenta_id)
                Bitacora.objects.create(
                    cuenta=cuenta,
                    tipo_accion=Bitacora.TipoAccion.REFRESCO_TOKEN,
                    modulo_afectado='autenticacion',
                    detalle='Refresco de token exitoso.',
                )

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class UserListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id='user_list',
        summary='Listar todos los usuarios',
        responses={200: UserListSerializer(many=True)},
    )
    def get(self, request):
        users = Cuenta.objects.all()
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        operation_id='user_create',
        summary='Crear un nuevo usuario (solo administradores)',
        request=UserCreateSerializer,
        responses={
            201: OpenApiResponse(response=UserListSerializer, description='Usuario creado correctamente.'),
            400: OpenApiResponse(description='Datos inválidos.'),
        },
    )
    def post(self, request):
        permission = IsAdmin()
        if not permission.has_permission(request, self):
            return Response(
                {'detail': 'Solo administradores pueden crear usuarios.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserListSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id='user_detail',
        summary='Obtener usuario por ID',
        responses={
            200: UserListSerializer,
            404: OpenApiResponse(description='Usuario no encontrado.'),
        },
    )
    def get(self, request, user_id):
        user = get_object_or_404(Cuenta, pk=user_id)
        serializer = UserListSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id='user_update',
        summary='Actualizar usuario (propio o como administrador)',
        request=UserUpdateSerializer,
        responses={
            200: UserListSerializer,
            403: OpenApiResponse(description='No tienes permiso.'),
            404: OpenApiResponse(description='Usuario no encontrado.'),
        },
    )
    def put(self, request, user_id):
        user = get_object_or_404(Cuenta, pk=user_id)
        
        # Verificar permisos
        is_admin = IsAdmin().has_permission(request, self)
        is_owner = request.user.id == user.id
        
        if not (is_admin or is_owner):
            return Response(
                {'detail': 'No tienes permiso para actualizar este usuario.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        serializer = UserUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.update(user, serializer.validated_data)
        
        return Response(
            UserListSerializer(user).data,
            status=status.HTTP_200_OK,
        )


class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id='user_delete',
        summary='Eliminar usuario (solo administradores)',
        responses={
            204: OpenApiResponse(description='Usuario eliminado.'),
            403: OpenApiResponse(description='No tienes permiso.'),
            404: OpenApiResponse(description='Usuario no encontrado.'),
        },
    )
    def delete(self, request, user_id):
        permission = IsAdmin()
        if not permission.has_permission(request, self):
            return Response(
                {'detail': 'Solo administradores pueden eliminar usuarios.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        user = get_object_or_404(Cuenta, pk=user_id)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RoleListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id='role_list',
        summary='Listar todos los roles disponibles',
        responses={200: RolSerializer(many=True)},
    )
    def get(self, request):
        roles = Rol.objects.all()
        serializer = RolSerializer(roles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RoleCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id='role_create',
        summary='Crear un nuevo rol (solo administradores)',
        request=RoleCreateSerializer,
        responses={
            201: OpenApiResponse(response=RolSerializer, description='Rol creado correctamente.'),
            400: OpenApiResponse(description='Datos inválidos.'),
            403: OpenApiResponse(description='Solo administradores pueden crear roles.'),
        },
    )
    def post(self, request):
        permission = IsAdmin()
        if not permission.has_permission(request, self):
            return Response(
                {'detail': 'Solo administradores pueden crear roles.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        serializer = RoleCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rol = serializer.save()
        
        # Registrar en bitacora
        Bitacora.objects.create(
            cuenta=request.user,
            tipo_accion=Bitacora.TipoAccion.CAMBIO_ROL,
            modulo_afectado='roles',
            detalle=f'Creación de nuevo rol: {rol.nombre}',
        )
        
        return Response(
            RolSerializer(rol).data,
            status=status.HTTP_201_CREATED,
        )


class BitacoraListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id='bitacora_list',
        summary='Listar registros de auditoría (solo administradores)',
        responses={
            200: BitacoraListSerializer(many=True),
            403: OpenApiResponse(description='Solo administradores pueden ver los registros.'),
        },
    )
    def get(self, request):
        permission = IsAdmin()
        if not permission.has_permission(request, self):
            return Response(
                {'detail': 'Solo administradores pueden ver los registros de auditoría.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        bitacoras = Bitacora.objects.all()[:100]  # Últimos 100 registros
        serializer = BitacoraListSerializer(bitacoras, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
