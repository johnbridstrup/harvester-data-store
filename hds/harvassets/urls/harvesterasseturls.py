from rest_framework import routers
from ..views import HarvesterAssetView


router = routers.SimpleRouter()
router.register(r"", HarvesterAssetView, basename="harvassets")

urlpatterns = [] + router.urls
