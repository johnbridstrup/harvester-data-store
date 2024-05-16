from rest_framework import routers
from .views import ConfigReportView


router = routers.SimpleRouter()
router.register(r"", ConfigReportView, basename="configreports")

urlpatterns = [] + router.urls
