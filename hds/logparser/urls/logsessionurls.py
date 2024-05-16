from rest_framework import routers
from logparser.views import logsessionviews

router = routers.SimpleRouter()
router.register(r"", logsessionviews.LogSessionViewset, basename="logsession")


urlpatterns = [] + router.urls
