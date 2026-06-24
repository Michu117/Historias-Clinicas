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
from django.http import JsonResponse
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import (
SpectacularAPIView,
SpectacularSwaggerView,
SpectacularRedocView,
)

def api_root(request):
"""Vista raíz de la API"""
return JsonResponse({
"success": True,
"message": "API HistoriasClinicas v1",
"endpoints": {
"admin": "/admin/",
"Historias": "/api/v1/historias/",
"documentacion_historias": {
"historias_clinicas": "/api/v1/historias/historias-clinicas/",
"casos": "/api/v1/historias/casos/",
"antecedentes": "/api/v1/historias/antecedentes/",
"documentos": "/api/v1/historias/documentos/",
},
"agendas": "/api/v1/agendas/",
"notificaciones": "/api/v1/notificaciones/",
"auth": "/api/v1/auth/",
"reportes": "/api/v1/reportes/",
"documentacion": {
"atenciones": "/api/v1/reportes/atenciones/",
"estadisticas": "/api/v1/reportes/estadisticas/",
"consultas_por_genero": "/api/v1/reportes/consultas-por-genero/",
"diagnosticos_frecuentes": "/api/v1/reportes/diagnosticos-frecuentes/",
"servicios_mas_usados": "/api/v1/reportes/servicios-mas-usados/",
}
}
})

urlpatterns = [
path('', api_root, name='api-root'),
path('admin/', admin.site.urls),

```
path('api/v1/agendas/', include('Agendas.urls')),
path('api/v1/auth/', include('Seguridad.urls')),
path('api/v1/historias/', include('Historias.urls')),
path('api/v1/reportes/', include('Reportes.urls')),
path('api/v1/notificaciones/', include('Notificaciones.urls')),

path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair_v1'),
path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh_v1'),

path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
```

]
