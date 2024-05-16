from rest_framework import routers
from ..views import AFTExceptionCodeView


router = routers.SimpleRouter()
router.register(r"", AFTExceptionCodeView, basename="exceptioncode")

urlpatterns = [] + router.urls
