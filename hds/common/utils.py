""" utilities and helper functions """
from .async_metrics import TOTAL_ERROR_COUNTER
from collections import defaultdict
from django.conf import settings
from django.urls import resolve, reverse, URLPattern, URLResolver
from django.urls.exceptions import NoReverseMatch
from rest_framework.response import Response
from rest_framework.views import exception_handler
from urllib.parse import urljoin, urlencode

import importlib
import os
import structlog
import sys
import traceback

logger = structlog.get_logger(__name__)


def get_key(file):
    """return full key of s3 file"""
    return os.path.join(file.storage.location, file.name)


def media_upload_path(instance, filename, username=None):
    """save media file to custom path."""
    if settings.USES3:
        if username is not None:
            subdir = username
        else:
            try:
                subdir = instance.creator.username
            except AttributeError:
                subdir = "general"

        return os.path.join("media", "uploads", subdir, filename)
    return f"uploads/{filename}"


def build_frontend_url(endpoint, _id=None):
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    frontend_url = frontend_url + f"/{endpoint}/"
    if _id:
        frontend_url = frontend_url + f"{_id}/"
    return frontend_url


def build_api_url(request, rel_path, api_version=None, params: dict = None):
    base = request._current_scheme_host
    if api_version == "current":
        api_version = "api/v1/"
    api_base_url = urljoin(base, api_version)
    api_url = urljoin(api_base_url, rel_path)
    if not api_url.endswith("/"):
        api_url += "/"

    if params:
        api_url += f"?{urlencode(params)}"

    return api_url


def make_ok(response_message, response_data=None, response_status=200):
    """generate success response"""
    response = {
        "status": "success",
        "message": response_message,
    }
    if response_data is not None:
        response["data"] = response_data
    return Response(response, status=response_status)


def make_error(errors, response_status=400):
    """generate error response"""
    return Response(
        {
            "status": "error",
            "errors": errors,
        },
        status=response_status,
    )


def custom_exception_handler(exc, context):
    """custom exception handler"""
    # to check if view does not have basename
    try:
        basename = context["view"].basename
    except AttributeError:
        basename = context["view"]

    # Increment error counter
    TOTAL_ERROR_COUNTER.labels(exc.__class__.__name__, basename).inc()

    # Log exception information
    logger.error(
        "An exception occurred during a request.",
        http_method=context["request"]._request.method,
        view=basename,
        user=context["request"].user.username,
    )
    logger.error(
        exc,
        http_method=context["request"]._request.method,
        view=basename,
        user=context["request"].user.username,
    )
    for tb in traceback.format_tb(exc.__traceback__):
        logger.debug(
            tb,
            http_method=context["request"]._request.method,
            view=basename,
            user=context["request"].user.username,
        )

    # Call REST framework's default exception handler
    # to get the standard error response.

    response = exception_handler(exc, context)
    errors = {}
    error_status_code = 400

    # loop through exc and add to errors
    if exc.__dict__.items():
        for key, value in exc.__dict__.items():
            errors[key] = value
            # this may be useful in future to filter out certain errors
            # if key == 'detail':
            #     errors['detail'] = str(value)
            # elif key == 'args':
            #     errors['args'] = json.dumps(value)
            # elif key == 'message':
            #     errors['message'] = str(value)
            # elif key == 'code':
            #     errors['code'] = str(value)
            # elif key == 'headers':
            #     errors['headers'] = json.dumps(value)
            # elif key == 'reason':
            #     errors['reason'] = str(value)
            # elif key == 'status_code':
            #     errors['status_code'] = str(value)
            # elif key == 'status':
            #     errors['status'] = str(value)
    else:
        errors["exception"] = str(exc)

    # Now add the HTTP status code to the response.
    if response is not None:
        error_status_code = response.status_code

    return make_error(errors, error_status_code)


def test_env():
    if sys.argv[1:2] == ["test"]:
        return True
    return False


def merge_nested_dict(d1, d2, overwrite_none=False):
    """Right merge two nested dicts.

    Args:
        d1 (dict): Left dict. May have values overwritten.
        d2 (dict): Right dict. Will retain all values
        overwrite_none (bool, Optional): Whether to overwrite the entire key if d2 value for key is None

    Returns:
        dict: Merged dict
    """
    d = defaultdict(dict)
    d.update(d1)
    for k, v in d2.items():
        if overwrite_none and (v is None):
            d[k] = {}
        elif not isinstance(v, dict):
            d[k] = v
        else:
            try:
                d.update({k: merge_nested_dict(d[k], v)})
            except ValueError:
                # d1 doesn't have a dict at this key, overwrite value with v
                d[k] = v
    return dict(d)


## Roles utility functions
def get_url_permissions(urlpatterns):
    """Retrieve role permissions per endpoint.

    This method walks through all of the url patterns defined for the api and retrieves:
       - Their fully qualified URL
       - The actions available at this endpoint
       - The view_permissions dictionary for the view class
       - The view class

    It will not parse generic API views, only DRF ModelViewSet classes.

    Args:
        urlpatterns (list): Django urlpatterns from router

    Returns:
        list: [url (str), actions (list), view_permisions (dict), view (ModelViewSet)]
    """

    permission_matrix = []
    for pat in urlpatterns:
        if isinstance(pat, URLResolver):
            # Recursively walk through URLResolvers
            permission_matrix.extend(get_url_permissions(pat.url_patterns))
        elif isinstance(pat, URLPattern):
            try:
                actions = pat.callback.actions
            except:
                # There are no actions defined, rest-framework-roles doesn't apply
                continue
            try:
                url = reverse(pat.name)
                view_func = resolve(url).func
            except NoReverseMatch:
                try:
                    url = reverse(pat.name, args=[0])
                    view_func = resolve(url).func
                except NoReverseMatch:
                    logger.warning(
                        f"Skipping: No reverse match", pattern_name=pat.name
                    )
                    continue

            # Import the view class
            view_mod = importlib.import_module(view_func.__module__)
            view = getattr(view_mod, view_func.__name__)
            try:
                view_permissions = view().view_permissions
            except Exception as e:
                logger.exception(
                    "There are no view permisions for this view",
                    view=view.__name__,
                )
                continue
            permission_matrix.append((url, actions, view_permissions, view))
    return permission_matrix
