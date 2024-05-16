from rest_framework import routers
from ..views import EventView


router = routers.SimpleRouter()
router.register(r"", EventView, basename="event")

urlpatterns = [] + router.urls
