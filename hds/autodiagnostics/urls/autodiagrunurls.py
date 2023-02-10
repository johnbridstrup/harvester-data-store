from rest_framework import routers
from ..views import AutodiagnosticsRunView


router = routers.SimpleRouter()
router.register(r'', AutodiagnosticsRunView, basename='autodiagnosticsrun')

urlpatterns = [
] + router.urls