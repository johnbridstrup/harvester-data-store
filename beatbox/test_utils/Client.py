import requests
import logging
from requests.status_codes import codes
from urllib.parse import urljoin

from .Endpoints import Endpoints

logger = logging.getLogger(__name__)


class Client:
    def __init__(self, username, password, base_url):
        self.base_url = base_url
        self.username = username
        self.password = password
        self._token = None
        self._additional_headers = {}

        self.login()

    @property
    def headers(self):
        return {
            "Authorization": f"Token {self._token}",
            **self._additional_headers,
        }

    def set_headers(self, **headers):
        self._additional_headers.update(headers)

    def clear_headers(self):
        self._additional_headers = {}

    def login(self):
        login_info = {
            "username": self.username,
            "password": self.password,
        }

        r = self.post(Endpoints.LOGIN, login_info)
        r.raise_for_status()

        data = r.json()["data"]["data"]
        self._token = data["token"]

        logger.info(f"Logged in user {self.username}")

    def get(self, endpoint: Endpoints, params=None):
        url = urljoin(self.base_url, endpoint.value)
        r = requests.get(url, headers=self.headers, params=params or {})
        return r

    def post(self, endpoint:Endpoints, data=None, params=None):
        url = urljoin(self.base_url, endpoint.value)
        r = requests.post(url, data, params=params or None)
        return r
