import requests
import structlog
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed


logger = structlog.getLogger(__name__)


class GithubClient:

    @staticmethod
    def exchange_code_for_token(code):
        access_token_url = "https://github.com/login/oauth/access_token"
        param_payload = {
            'client_id': settings.GITHUB_CLIENT_ID,
            'client_secret': settings.GITHUB_CLIENT_SECRET,
            'code': code
        }
        headers = {'Accept': 'application/json'}
        try:
            res = requests.post(access_token_url, params=param_payload, headers=headers)
            token = res.json().get("access_token")
        except Exception as e:
            logger.exception(e)
            token = None
        return token

    @staticmethod
    def retrieve_github_user(access_token):
        github_user_url = "https://api.github.com/user"
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        try:
            response = requests.get(github_user_url, headers=headers)
            return response.json()
        except Exception as e:
            raise AuthenticationFailed(detail=e)
