from rest_framework import routers
from ..views import S3FileView


router = routers.SimpleRouter()
router.register(r'', S3FileView)

urlpatterns = [
] + router.urls