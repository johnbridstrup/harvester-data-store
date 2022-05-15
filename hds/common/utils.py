""" utilities and helper functions """
from rest_framework.response import Response


def sendresponse(response_status, response_message, response_data, status_code):
    """ send response to client """
    if response_status == 'success':
        return Response({
            'status': response_status,
            'message': response_message,
            'data': response_data
        }, status=status_code)
    else:
        return Response({
            'status': response_status,
            'errors': response_message
        }, status=status_code)

