from rest_framework import routers
from jobscheduler.views import ScheduledJobView


router = routers.SimpleRouter()
router.register(r'', ScheduledJobView, basename='jobscheduler')

urlpatterns = [
] + router.urls