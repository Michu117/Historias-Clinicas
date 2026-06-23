import csv
from io import BytesIO

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.utils import OpenApiExample, OpenApiParameter, OpenApiResponse, extend_schema

from .models import Bitacora, Cuenta, Rol, Usuario
from .permissions import IsAdmin, IsOwnerOrAdmin
from .serializers import (
    AuthResponseSerializer,
    BitacoraListSerializer,
    CambiarClaveSerializer,
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
from .services import (
    generar_tokens,
    obtener_bitacoras,
    obtener_cuenta_por_correo,
    obtener_usuarios,
    registrar_bitacora,
)


def _get_client_ip(request):
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


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
        registrar_bitacora(
            cuenta=cuenta,
            tipo_accion=Bitacora.TipoAccion.REGISTRO,
            modulo_afectado='autenticacion',
            detalle='Registro de cuenta exitoso.',
            direccion_ip=_get_client_ip(request),
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
        cuenta = obtener_cuenta_por_correo(correo)
        
        if not serializer.is_valid():
            # Registrar intento fallido
            if cuenta:
                registrar_bitacora(
                    cuenta=cuenta,
                    tipo_accion=Bitacora.TipoAccion.INICIO_SESION_FALLIDO,
                    modulo_afectado='autenticacion',
                    detalle='Intento de inicio de sesión fallido.',
                    direccion_ip=_get_client_ip(request),
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        cuenta = serializer.validated_data['user']
        registrar_bitacora(
            cuenta=cuenta,
            tipo_accion=Bitacora.TipoAccion.INICIO_SESION,
            modulo_afectado='autenticacion',
            detalle='Inicio de sesión exitoso.',
            direccion_ip=_get_client_ip(request),
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
                registrar_bitacora(
                    cuenta=cuenta,
                    tipo_accion=Bitacora.TipoAccion.REFRESCO_TOKEN,
                    modulo_afectado='autenticacion',
                    detalle='Refresco de token exitoso.',
                    direccion_ip=_get_client_ip(request),
                )

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class UserListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id='user_list',
        summary='Listar todos los usuarios',
        parameters=[
            OpenApiParameter(name='rol', description='Filtrar por nombre de rol', required=False, type=str),
            OpenApiParameter(name='activo', description='Filtrar por estado (true/false)', required=False, type=str),
            OpenApiParameter(name='busqueda', description='Buscar por correo, nombre, apellido o cédula', required=False, type=str),
        ],
        responses={200: UserListSerializer(many=True)},
    )
    def get(self, request):
        params = request.query_params
        users = obtener_usuarios(
            rol_nombre=params.get('rol'),
            activo={'true': True, 'false': False, '1': True, '0': False}.get(params.get('activo', '').lower()) if params.get('activo') else None,
            busqueda=params.get('busqueda'),
        )
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
        registrar_bitacora(
            cuenta=request.user,
            tipo_accion=Bitacora.TipoAccion.CAMBIO_ROL,
            modulo_afectado='roles',
            detalle=f'Creación de nuevo rol: {rol.nombre}',
            direccion_ip=_get_client_ip(request),
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
        parameters=[
            OpenApiParameter(name='fecha_desde', description='Fecha inicio (YYYY-MM-DD)', required=False, type=str),
            OpenApiParameter(name='fecha_hasta', description='Fecha fin (YYYY-MM-DD)', required=False, type=str),
            OpenApiParameter(name='tipo_accion', description='Filtrar por tipo de acción', required=False, type=str),
            OpenApiParameter(name='usuario', description='Filtrar por correo de usuario', required=False, type=str),
            OpenApiParameter(name='limite', description='Máximo de registros (default 100)', required=False, type=int),
        ],
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
        
        params = request.query_params
        bitacoras = obtener_bitacoras(
            fecha_desde=params.get('fecha_desde'),
            fecha_hasta=params.get('fecha_hasta'),
            tipo_accion=params.get('tipo_accion'),
            usuario_correo=params.get('usuario'),
            limite=int(params.get('limite', '100')),
        )
        serializer = BitacoraListSerializer(bitacoras, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


def _export_csv(bitacoras):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="auditoria_logs.csv"'
    writer = csv.writer(response)
    writer.writerow(['ID', 'Fecha/Hora', 'Tipo Acción', 'Módulo', 'Usuario', 'IP', 'Detalle'])
    for b in bitacoras:
        writer.writerow([
            b.id,
            b.fecha_hora.strftime('%Y-%m-%d %H:%M:%S'),
            b.get_tipo_accion_display(),
            b.modulo_afectado,
            b.cuenta.correo if b.cuenta else '',
            b.direccion_ip or '',
            b.detalle,
        ])
    return response


def _export_pdf(bitacoras):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), title='Auditoría de Seguridad')
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title2', parent=styles['Title'], fontSize=16, spaceAfter=20)
    normal = styles['Normal']

    elements = []
    elements.append(Paragraph('Reporte de Auditoría de Seguridad', title_style))
    elements.append(Spacer(1, 0.5 * cm))

    headers = ['ID', 'Fecha/Hora', 'Tipo Acción', 'Módulo', 'Usuario', 'IP', 'Detalle']
    data = [headers]
    for b in bitacoras:
        data.append([
            str(b.id),
            b.fecha_hora.strftime('%Y-%m-%d %H:%M:%S'),
            b.get_tipo_accion_display(),
            b.modulo_afectado,
            b.cuenta.correo if b.cuenta else '',
            b.direccion_ip or '',
            b.detalle,
        ])

    col_widths = [30, 130, 100, 80, 130, 90, 140]
    table = Table(data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 7),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f1f5f9')]),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 0.5 * cm))
    elements.append(Paragraph(f'Total de registros: {len(bitacoras)}', normal))

    doc.build(elements)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="auditoria_logs.pdf"'
    return response


class BitacoraExportView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id='bitacora_export',
        summary='Exportar registros de auditoría (solo administradores)',
        parameters=[
            OpenApiParameter(name='fecha_desde', required=False, type=str),
            OpenApiParameter(name='fecha_hasta', required=False, type=str),
            OpenApiParameter(name='tipo_accion', required=False, type=str),
            OpenApiParameter(name='formato', description='Formato: csv o pdf (default csv)', required=False, type=str),
        ],
        responses={200: OpenApiResponse(description='Archivo de auditoría.')},
    )
    def get(self, request):
        permission = IsAdmin()
        if not permission.has_permission(request, self):
            return Response(
                {'detail': 'Solo administradores pueden exportar los registros.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        params = request.query_params
        bitacoras = obtener_bitacoras(
            fecha_desde=params.get('fecha_desde'),
            fecha_hasta=params.get('fecha_hasta'),
            tipo_accion=params.get('tipo_accion'),
            limite=10000,
        )

        formato = params.get('formato', 'csv').lower()
        if formato == 'pdf':
            return _export_pdf(bitacoras)
        return _export_csv(bitacoras)


class CambiarClaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CambiarClaveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cuenta = request.user
        cuenta.set_password(serializer.validated_data['clave_nueva'])
        cuenta.must_change_password = False
        cuenta.save(update_fields=['password', 'must_change_password'])
        return Response({'detail': 'Contraseña actualizada correctamente.'}, status=status.HTTP_200_OK)
