from rest_framework import routers
from ..views.locationview import LocationView


router = routers.SimpleRouter()
router.register(r'', LocationView)

urlpatterns = [
] + router.urls
