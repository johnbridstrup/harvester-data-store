from rest_framework import routers
from ..views.releaseview import HarvesterCodeReleaseView


router = routers.SimpleRouter()
router.register(r'', HarvesterCodeReleaseView, basename='harvcoderelease')

urlpatterns = [
] + router.urls