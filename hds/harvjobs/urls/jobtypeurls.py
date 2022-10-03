from rest_framework import routers
from ..views.jobtypeviews import JobTypeView


router = routers.SimpleRouter()
router.register(r'', JobTypeView, basename='jobtype')

urlpatterns = [
] + router.urls