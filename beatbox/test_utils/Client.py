import requests
import logging
from requests.adapters import HTTPAdapter, Retry
from requests.status_codes import codes
from urllib.parse import urljoin

from .Endpoints import Endpoints

logger = logging.getLogger(__name__)


class Client:
    RETRIES = Retry(
        total=5,
        backoff_factor=0.1,
        status_forcelist=[
            codes.server_error,
            codes.bad_gateway,
            codes.service_unavailable,
            codes.gateway_timeout,
        ]
    )
    def __init__(self, username, password, base_url, base_test_params=None):
        self.base_url = base_url
        self.username = username
        self.password = password
        self._token = None
        self._additional_headers = {}
        self._base_test_params = base_test_params or {}
        self._session = requests.Session()
        self._session.mount('https://', HTTPAdapter(max_retries=self.RETRIES))
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

    def login(self, addtl_params=None):
        if addtl_params:
            self._base_test_params.update(addtl_params or {})
        login_info = {
            "username": self.username,
            "password": self.password,
        }

        r = self.post(Endpoints.LOGIN, login_info, params=self._base_test_params)
        r.raise_for_status()

        data = r.json()["data"]["data"]
        self._token = data["token"]

        logger.info(f"Logged in user {self.username}")

    def _build_full_params(self, params):
        params = params or {}
        params = {**self._base_test_params, **params}
        return params
    
    def get(self, endpoint: Endpoints, params=None):
        url = urljoin(self.base_url, endpoint.value)
        params = self._build_full_params(params)
        r = self._session.get(url, headers=self.headers, params=params or {})
        return r

    def post(self, endpoint:Endpoints, data=None, params=None):
        url = urljoin(self.base_url, endpoint.value)
        params = self._build_full_params(params)
        r = self._session.post(url, data, params=params)
        return r

    def delete(self, endpoint: Endpoints, id_, params=None):
        url = urljoin(self.base_url, endpoint.value)
        det_url = urljoin(url, id_)
        if not det_url.endswith('/'):
            det_url += '/'
        
        params = self._build_full_params(params)
        r = self._session.delete(det_url, headers=self.headers, params=params)
        return r
