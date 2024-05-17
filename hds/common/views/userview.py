from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import update_last_login, User
from django.contrib.auth import authenticate
from django.middleware.csrf import get_token
from django.conf import settings
from rest_framework.authtoken.models import Token
from common.renderers import HDSJSONRenderer
from common.utils import make_ok
from common.github import GithubClient
from common.models import UserProfile
from common.serializers.userserializer import (
    UserCreateSerializer,
    UserSerializer,
)


class LoginAPIView(APIView):
    """Login and generate auth token"""

    renderer_classes = (HDSJSONRenderer,)

    def post(self, request, *args, **kwargs):
        try:
            # username and password are required
            if (
                "username" not in request.data.keys()
                or "password" not in request.data.keys()
            ):
                raise Exception("username and password are required")

            user = authenticate(
                username=request.data["username"],
                password=request.data["password"],
            )
            if user is not None:
                update_last_login(None, user)
                token, created = Token.objects.get_or_create(user=user)
                serializer = UserSerializer(user)
                return make_ok(
                    "Login successful",
                    {"token": token.key, "user": serializer.data},
                )
            else:
                raise Exception("invalid username or password")
        except Exception as e:
            raise Exception(str(e))


class LogoutAPIView(APIView):
    """Logout and invalidate auth token"""

    renderer_classes = (HDSJSONRenderer,)

    def post(self, request, *args, **kwargs):
        try:
            if "token" not in request.data.keys():
                raise Exception("token is required")
            else:
                # delete token
                token = Token.objects.filter(key=request.data["token"])
                if token.exists():
                    token.delete()
                    return make_ok("Logout successful", {})
                else:
                    raise Exception("invalid token")
        except Exception as e:
            raise Exception(str(e))


class CSRFAPIView(APIView):
    """get csrf token for every post request"""

    renderer_classes = (HDSJSONRenderer,)

    def get(self, request, *args, **kwargs):
        return make_ok("CSRF successful", {"csrftoken": get_token(request)})

    def post(self, request, *args, **kwargs):
        return make_ok("result successful", {"result": "ok"})


class ManageUserView(ModelViewSet):
    """manage user api viewset"""

    serializer_class = UserSerializer
    renderer_classes = (HDSJSONRenderer,)
    permission_classes = (IsAuthenticated,)
    queryset = User.objects.all()

    def get_serializer_class(self):
        """
        switch serializer to UserCreateSerializer for create action
        """
        if self.action == "create":
            self.serializer_class = UserCreateSerializer
        return self.serializer_class


class ChangePasswordView(APIView):
    """validate user password and update new password"""

    renderer_classes = (HDSJSONRenderer,)
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        try:
            # current_password and new_password are required
            if (
                "current_password" not in request.data.keys()
                or "new_password" not in request.data.keys()
            ):
                raise Exception(
                    "current_password and new_password are required"
                )
            if request.user.check_password(request.data["current_password"]):
                request.user.set_password(request.data["new_password"])
                request.user.save()
                return make_ok("Password changed successful", {})
            raise Exception("could not authenticate with given credentials")
        except Exception as e:
            raise Exception(str(e))


class GithubOauthView(APIView):
    """
    Authenticate with Github Oauth
    """

    renderer_classes = (HDSJSONRenderer,)

    def post(self, request, *args, **kwargs):
        try:
            code = request.data.get("code", None)
            if not code:
                raise AuthenticationFailed("code is required for login")
            access_token = GithubClient.exchange_code_for_token(code)
            if access_token:
                # check if the user is in the organization
                user_orgs = GithubClient.get_user_orgs(access_token)
                if not GithubClient.is_user_in_organization(user_orgs):
                    raise AuthenticationFailed(
                        f"Only members of the organization ({settings.GITHUB_ORG}) allowed"
                    )

                github_user = GithubClient.retrieve_github_user(access_token)
                username = github_user.get("login")

                try:
                    # try and get existing user by github username
                    user = User.objects.get(username=username)
                except User.DoesNotExist:
                    full_name = github_user.get("name")
                    avatar_url = github_user.get("avatar_url")
                    name_list = full_name.split(" ")
                    first_name, last_name = None, None
                    if len(name_list) == 2:
                        first_name, last_name = name_list
                    elif len(name_list) == 3:
                        first_name, _, last_name = name_list

                    user = User.objects.create_user(
                        username=username,
                        first_name=first_name,
                        last_name=last_name,
                    )
                    UserProfile.objects.create(user=user, avatar_url=avatar_url)
                update_last_login(None, user)
                token, _ = Token.objects.get_or_create(user=user)
                serializer = UserSerializer(user)
                return make_ok(
                    "Login successful",
                    {"token": token.key, "user": serializer.data},
                )
            raise AuthenticationFailed(detail="Token is invalid or has expired")
        except Exception as e:
            raise AuthenticationFailed(detail=str(e))
