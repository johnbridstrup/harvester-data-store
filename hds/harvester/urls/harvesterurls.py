from rest_framework import routers
from ..views.harvesterview import HarvesterView


router = routers.SimpleRouter()
router.register(r"", HarvesterView, basename="harvester")

urlpatterns = [] + router.urls
