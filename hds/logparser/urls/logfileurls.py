from rest_framework import routers
from logparser.views import logfileviews

router = routers.SimpleRouter()
router.register(r"", logfileviews.LogFileViewSet, basename="logfile")


urlpatterns = [] + router.urls
