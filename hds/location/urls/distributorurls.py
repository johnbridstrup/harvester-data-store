from rest_framework import routers
from ..views.distributorview import DistributorView


router = routers.SimpleRouter()
router.register(r"", DistributorView, basename="distributor")

urlpatterns = [] + router.urls
