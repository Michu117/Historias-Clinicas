"""
URL configuration for HistoriasClinicas project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

def api_root(request):
    """Vista raíz de la API"""
    return JsonResponse({
        "success": True,
        "message": "API HistoriasClinicas v1",
        "endpoints": {
            "admin": "/admin/",
            "reportes": "/api/v1/reportes/",
            "documentacion": {
                "atenciones": "/api/v1/reportes/atenciones/",
                "estadisticas": "/api/v1/reportes/estadisticas/",
                "diagnosticos_frecuentes": "/api/v1/reportes/diagnosticos-frecuentes/",
                "servicios_mas_usados": "/api/v1/reportes/servicios-mas-usados/"
            }
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    # JWT token endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/reportes/', include('Reportes.urls')),
]
