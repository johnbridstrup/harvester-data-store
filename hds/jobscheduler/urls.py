from rest_framework import routers
from .views import ScheduledJobView


router = routers.SimpleRouter()
router.register(r'', ScheduledJobView, basename='jobscheduler')

urlpatterns = [
] + router.urls