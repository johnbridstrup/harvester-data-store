from rest_framework import routers
from ..views import HarvesterAssetReportView


router = routers.SimpleRouter()
router.register(r'', HarvesterAssetReportView, basename='harvassetreport')

urlpatterns = [
] + router.urls