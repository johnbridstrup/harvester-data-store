from rest_framework import routers
from .views import NotificationView


router = routers.SimpleRouter()
router.register(r'', NotificationView, basename="notification")

urlpatterns = [
] + router.urls