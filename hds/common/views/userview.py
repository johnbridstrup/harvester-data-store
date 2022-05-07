from rest_framework.views import APIView
from django.contrib.auth.models import update_last_login
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from common.utils import sendresponse


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
                return sendresponse(
                    response_status="success",
                    response_message="Login Successful",
                    response_data={"token": token.key},
                    status_code=200)
            else:
                message = {**message, **{"invalid_credentials": "invalid username or password"}}
                raise Exception("invalid username or password")
        except Exception as e:
            return sendresponse(
                response_status='error',
                response_message={**message, "exception": str(e)},
                response_data={},
                status_code=400)


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
                    return sendresponse(
                        response_status="success",
                        response_message="Logout Successful",
                        response_data={},
                        status_code=200)
                else:
                    message = {**message, **{"invalid_token": "invalid token"}}
                    raise Exception("invalid token")
        except Exception as e:
            return sendresponse(
                response_status='error',
                response_message={**message, "exception": str(e)},
                response_data={},
                status_code=400)
