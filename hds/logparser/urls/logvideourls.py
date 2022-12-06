from rest_framework import routers
from logparser.views import logvideoviews

router = routers.SimpleRouter()
router.register(r'', logvideoviews.LogVideoViewSet, basename='logvideo')


urlpatterns = [
] + router.urls
