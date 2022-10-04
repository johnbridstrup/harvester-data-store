from rest_framework import routers
from ..views.jobviews import JobView


router = routers.SimpleRouter()
router.register(r'', JobView, basename='job')

urlpatterns = [
] + router.urls