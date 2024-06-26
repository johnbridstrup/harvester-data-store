from rest_framework import routers
from ..views.harvesterswinfoview import HarvesterSwInfoView


router = routers.SimpleRouter()
router.register(r"", HarvesterSwInfoView, basename="harvesterswinfo")

urlpatterns = [] + router.urls
