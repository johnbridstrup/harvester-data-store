from rest_framework import routers
from .views import MigrationLogView


router = routers.SimpleRouter()
router.register(r'', MigrationLogView, basename='hdsmigrations')

urlpatterns = [
] + router.urls