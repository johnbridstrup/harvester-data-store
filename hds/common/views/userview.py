from rest_framework.views import APIView
from django.contrib.auth.models import update_last_login
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from common.utils import make_ok


class LoginAPIView(APIView):
    """Login and generate auth token"""
    def post(self, request, *args, **kwargs):
        try:
            message = {}
            # username and password are required
            if "username" not in request.data.keys() or "password" not in request.data.keys():
                message = {**message, **{"missing_parameters": "username and password are required"}}
                raise Exception("username and password are required")

            user = authenticate(username=request.data['username'], password=request.data['password'])
            if user is not None:
                update_last_login(None, user)
                token, created = Token.objects.get_or_create(user=user)
                return make_ok("Login successful", {"token": token.key})
            else:
                message = {**message, **{"invalid_credentials": "invalid username or password"}}
                raise Exception("invalid username or password")
        except Exception as e:
            raise Exception(str(e))


class LogoutAPIView(APIView):
    """Logout and invalidate auth token"""
    def post(self, request, *args, **kwargs):
        try:
            message = {}
            if "token" not in request.data.keys():
                message = {**message, **{"missing_parameters": "token is required"}}
                raise Exception("token is required")
            else:
                # delete token
                token = Token.objects.filter(key=request.data['token'])
                if token.exists():
                    token.delete()
                    return make_ok("Logout successful", {})
                else:
                    message = {**message, **{"invalid_token": "invalid token"}}
                    raise Exception("invalid token")
        except Exception as e:
            raise Exception(str(e))
