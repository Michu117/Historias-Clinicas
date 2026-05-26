from rest_framework.permissions import BasePermission


class HasRole(BasePermission):
    required_roles: set[str] = set()

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        if not self.required_roles:
            return True
        role_name = getattr(getattr(request.user, 'rol', None), 'nombre', None)
        return role_name in self.required_roles


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        role_name = getattr(getattr(request.user, 'rol', None), 'nombre', None)
        return role_name == 'admin'


class IsMedico(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        role_name = getattr(getattr(request.user, 'rol', None), 'nombre', None)
        return role_name in ('admin', 'medico')


class IsPsicologo(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        role_name = getattr(getattr(request.user, 'rol', None), 'nombre', None)
        return role_name in ('admin', 'psicologo')


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        role_name = getattr(getattr(request.user, 'rol', None), 'nombre', None)
        if role_name == 'admin':
            return True
        return obj.id == request.user.id
