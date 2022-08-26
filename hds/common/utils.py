""" utilities and helper functions """
from rest_framework.response import Response
from rest_framework.views import exception_handler

import logging
import os
import traceback


def build_frontend_url(endpoint, _id=None):
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    frontend_url = frontend_url + f"/{endpoint}/"
    if _id:
        frontend_url = frontend_url + f"{_id}/"
    return frontend_url

def make_ok(response_message, response_data, response_status=200):
    """ generate success response """
    return Response({
        'status': 'success',
        'message': response_message,
        'data': response_data
    }, status=response_status)


def make_error(errors, response_status=400):
    """ generate error response """
    return Response({
        'status': 'error',
        'errors': errors,
    }, status=response_status)


def custom_exception_handler(exc, context):
    """ custom exception handler """
    # to check if view does not have basename
    try:
        basename = context['view'].basename
    except AttributeError:
        basename = context['view']

    # Log exception information
    logging.error(
        "An exception occurred during {} request to {}".format(
            context['request']._request.method,
            basename
        )
    )
    logging.error(exc)
    for tb in traceback.format_tb(exc.__traceback__):
        logging.debug(tb)

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
        errors['exception'] = str(exc)

    # Now add the HTTP status code to the response.
    if response is not None:
        error_status_code = response.status_code

    return make_error(errors, error_status_code)
