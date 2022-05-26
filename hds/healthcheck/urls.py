from rest_framework import routers
from django.urls import path
from .views import HealthCheckView

router = routers.SimpleRouter()

urlpatterns = [
  path('healthcheck/', HealthCheckView.as_view(), name="health check"),
]