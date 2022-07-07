from rest_framework import routers
from django.urls import path
from ..views.landingview import LandingView, UserLoginView, UserLogoutView

router = routers.SimpleRouter()

urlpatterns = [
  path('', LandingView.as_view(), name="landing"),
  path('login', UserLoginView.as_view(), name="login"),
  path('logout', UserLogoutView.as_view(), name="logout"),
] + router.urls
