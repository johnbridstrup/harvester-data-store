from rest_framework import routers
from ..views import AFTExceptionView


router = routers.SimpleRouter()
router.register(r"", AFTExceptionView, basename="exception")

urlpatterns = [] + router.urls
