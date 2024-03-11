from rest_framework import routers
from ..views import GripReportView


router = routers.SimpleRouter()
router.register(r'', GripReportView, basename='gripreports')

urlpatterns = [
] + router.urls