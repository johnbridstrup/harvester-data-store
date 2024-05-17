import json
import os

from locust import HttpUser, events


CUR_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_DATA_DIR = os.path.abspath(
    os.path.join(CUR_DIR, "../hds/common/test_data/")
)
DEF_TOKEN = os.environ.get(
    "LOAD_TEST_TOKEN", "435b18abedef452f64e7f4ed2e68e98ac8babf5e"
)


@events.init_command_line_parser.add_listener
def _(parser):
    """Additional arguments"""

    parser.add_argument("--token", type=str, is_secret=True, default=DEF_TOKEN)


class UserBase(HttpUser):
    abstract = True

    def on_start(self):
        self.token = self.environment.parsed_options.token

    def _add_auth_headers(self, kwargs):
        headers = kwargs.pop("headers", {})
        headers["Authorization"] = f"Token {self.token}"
        return headers

    def _load_json(self, fname):
        fpath = os.path.join(TEST_DATA_DIR, fname)
        with open(fpath, "r") as f:
            d = json.load(f)
        return d

    def _load_big_json(self, fname):
        fpath = os.path.join(CUR_DIR, f"big_data/{fname}")
        with open(fpath, "r") as f:
            d = json.load(f)
        return d

    def get(self, *args, **kwargs):
        headers = self._add_auth_headers(kwargs)
        return self.client.get(*args, headers=headers, **kwargs)

    def post(self, *args, **kwargs):
        headers = self._add_auth_headers(kwargs)
        return self.client.post(*args, headers=headers, **kwargs)
