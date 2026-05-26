from django.urls import path

from .views import (
    BitacoraListView,
    LoginView,
    MeView,
    RefreshView,
    RegistroView,
    RoleCreateView,
    RoleListView,
    UserDeleteView,
    UserDetailView,
    UserListCreateView,
    UserUpdateView,
)

app_name = 'Seguridad'

urlpatterns = [
    path('register', RegistroView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('me', MeView.as_view(), name='me'),
    path('refresh', RefreshView.as_view(), name='refresh'),
    path('users', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:user_id>', UserDetailView.as_view(), name='user-detail'),
    path('users/<int:user_id>/update', UserUpdateView.as_view(), name='user-update'),
    path('users/<int:user_id>/delete', UserDeleteView.as_view(), name='user-delete'),
    path('roles', RoleListView.as_view(), name='role-list'),
    path('roles/create', RoleCreateView.as_view(), name='role-create'),
    path('logs', BitacoraListView.as_view(), name='bitacora-list'),
]
