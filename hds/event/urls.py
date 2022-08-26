from rest_framework import routers
from .views import EventView


router = routers.SimpleRouter()
router.register(r'', EventView)

urlpatterns = [
] + router.urls