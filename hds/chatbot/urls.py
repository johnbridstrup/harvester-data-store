from rest_framework import routers
from .views import ChatbotLogViewSet

router = routers.SimpleRouter()
router.register(r"", ChatbotLogViewSet, basename="chatbot")

urlpatterns = [] + router.urls
