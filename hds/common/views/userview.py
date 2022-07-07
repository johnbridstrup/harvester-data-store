from rest_framework.views import APIView
from django.contrib.auth.models import update_last_login
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from common.renderers import HDSJSONRenderer
from common.utils import make_ok


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
                return make_ok("Login successful", {"token": token.key})
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
