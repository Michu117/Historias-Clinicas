from rest_framework.permissions import BasePermission


def _tiene_rol(user, *roles):
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    user_roles = set(user.roles.values_list('nombre', flat=True))
    return bool(user_roles & set(roles))


class HasRole(BasePermission):
    required_roles: set[str] = set()

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        if not self.required_roles:
            return True
        user_roles = set(request.user.roles.values_list('nombre', flat=True))
        return bool(user_roles & self.required_roles)


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return _tiene_rol(request.user, 'admin')


class IsMedico(BasePermission):
    def has_permission(self, request, view):
        return _tiene_rol(request.user, 'admin', 'medico')


class IsPsicologo(BasePermission):
    def has_permission(self, request, view):
        return _tiene_rol(request.user, 'admin', 'psicologo')


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        if _tiene_rol(request.user, 'admin'):
            return True
        return obj.id == request.user.id
