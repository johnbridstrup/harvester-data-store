from rest_framework import routers
from ..views import CandidateView


router = routers.SimpleRouter()
router.register(r"", CandidateView, basename="candidates")

urlpatterns = [] + router.urls
