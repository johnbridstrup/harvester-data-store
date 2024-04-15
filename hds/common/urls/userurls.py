from rest_framework import routers
from django.urls import path
from ..views.userview import (
  CSRFAPIView,
  ChangePasswordView,
  GithubOauthView,
  LoginAPIView,
  LogoutAPIView,
  ManageUserView,
)

router = routers.SimpleRouter()
router.register('profiles', ManageUserView)

app_name = "users"

urlpatterns = [
  path('login/', LoginAPIView.as_view(), name="login"),
  path('logout/', LogoutAPIView.as_view(), name="logout"),
  path('csrf/', CSRFAPIView.as_view(), name="csrf"),
  path('change/password/', ChangePasswordView.as_view(), name="change_password"),
  path('github/oauth/', GithubOauthView.as_view(), name="github_oauth"),
] + router.urls
