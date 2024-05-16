from rest_framework import routers
from jobscheduler.views import PeriodicTaskView


router = routers.SimpleRouter()
router.register(r"", PeriodicTaskView, basename="periodictask")

urlpatterns = [] + router.urls
