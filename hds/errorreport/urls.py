from rest_framework import routers
from .views.errorreportview import ErrorReportView


router = routers.SimpleRouter()
router.register(r'', ErrorReportView, basename='errorreport')

urlpatterns = [
] + router.urls
