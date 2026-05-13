from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CitaViewSet, ServicioViewSet, AtencionViewSet,
    DerivacionViewSet, CertificadoViewSet
)

router = DefaultRouter()
router.register('citas', CitaViewSet, basename='cita')
router.register('servicios', ServicioViewSet, basename='servicio')
router.register('derivaciones', DerivacionViewSet, basename='derivacion')
router.register('certificados', CertificadoViewSet, basename='certificado')

urlpatterns = [
    path('', include(router.urls)),
    path('atenciones/', AtencionViewSet.as_view({'post': 'create'}), name='atencion-create'),
]
