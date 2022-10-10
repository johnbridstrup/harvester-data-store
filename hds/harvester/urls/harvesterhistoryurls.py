from rest_framework import routers
from ..views.harvesterview import HarvesterHistoryView


router = routers.SimpleRouter()
router.register(r'', HarvesterHistoryView)

urlpatterns = [
] + router.urls