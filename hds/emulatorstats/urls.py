from rest_framework import routers
from .views import EmuReportView


router = routers.SimpleRouter()
router.register(r"", EmuReportView, basename="emustatsreports")

urlpatterns = [] + router.urls
