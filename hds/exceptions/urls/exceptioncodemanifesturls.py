from rest_framework import routers
from ..views import AFTExceptionCodeManifestView


router = routers.SimpleRouter()
router.register(r'', AFTExceptionCodeManifestView, basename='codemanifest')

urlpatterns = [
] + router.urls