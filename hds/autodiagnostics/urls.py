from rest_framework import routers
from .views import AutodiagnosticsReportView


router = routers.SimpleRouter()
router.register(r'', AutodiagnosticsReportView, basename='autodiagnostics')

urlpatterns = [
] + router.urls