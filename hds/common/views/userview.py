from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import update_last_login, User
from django.contrib.auth import authenticate
from django.middleware.csrf import get_token
from rest_framework.authtoken.models import Token
from common.renderers import HDSJSONRenderer
from common.utils import make_ok
from common.serializers.userserializer import UserCreateSerializer, UserSerializer


class LoginAPIView(APIView):
    """Login and generate auth token"""
    renderer_classes = (HDSJSONRenderer,)

    def post(self, request, *args, **kwargs):
        try:
            # username and password are required
            if "username" not in request.data.keys() or "password" not in request.data.keys():
                raise Exception("username and password are required")

            user = authenticate(username=request.data['username'], password=request.data['password'])
            if user is not None:
                update_last_login(None, user)
                token, created = Token.objects.get_or_create(user=user)
                serializer = UserSerializer(user)
                return make_ok("Login successful", {"token": token.key, "user": serializer.data})
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
                token = Token.objects.filter(key=request.data['token'])
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
        return make_ok("CSRF successful", {'csrftoken': get_token(request)})

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
            if "current_password" not in request.data.keys() or "new_password" not in request.data.keys():
                raise Exception("current_password and new_password are required")
            if request.user.check_password(request.data["current_password"]):
                request.user.set_password(request.data["new_password"])
                request.user.save()
                return make_ok("Password changed successful", {})
            raise Exception("could not authenticate with given credentials")
        except Exception as e:
            raise Exception(str(e))
