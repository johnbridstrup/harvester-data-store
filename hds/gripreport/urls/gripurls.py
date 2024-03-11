from rest_framework import routers
from ..views import GripView


router = routers.SimpleRouter()
router.register(r'', GripView, basename='grips')

urlpatterns = [
] + router.urls
