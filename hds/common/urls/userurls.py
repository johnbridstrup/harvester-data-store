from rest_framework import routers
from django.urls import path
from ..views.userview import CSRFAPIView, LoginAPIView, LogoutAPIView

router = routers.SimpleRouter()

urlpatterns = [
  path('login/', LoginAPIView.as_view(), name="login"),
  path('logout/', LogoutAPIView.as_view(), name="logout"),
  path('csrf/', CSRFAPIView.as_view(), name="csrf"),
]
