from enum import Enum


API_VERS = "/api/v1"

class Endpoints(Enum):
    LOGIN = f"{API_VERS}/users/login/"
    ERROR = f"{API_VERS}/errorreports/"
    EXCEPTIONS = f"{API_VERS}/exceptions/"
    HARVESTERS = f"{API_VERS}/harvesters/"
