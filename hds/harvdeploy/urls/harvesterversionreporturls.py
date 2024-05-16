from rest_framework import routers
from ..views.versionview import HarvesterVersionReportView


router = routers.SimpleRouter()
router.register(r"", HarvesterVersionReportView, basename="harvcodeversion")

urlpatterns = [] + router.urls
