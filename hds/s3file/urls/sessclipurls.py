from rest_framework import routers
from ..views import SessClipView


router = routers.SimpleRouter()
router.register(r"", SessClipView, basename="sessclip")

urlpatterns = [] + router.urls
