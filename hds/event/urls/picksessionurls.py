from rest_framework import routers
from ..views import PickSessionView


router = routers.SimpleRouter()
router.register(r"", PickSessionView, basename="picksession")

urlpatterns = [] + router.urls
