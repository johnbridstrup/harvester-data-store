""" utilities and helper functions """
from rest_framework.response import Response
from rest_framework import status


def sendresponse(response_status, response_message, response_data, status_code):
    """ send response to client """
    print("status = ", response_status)
    if response_status == 'success':
        return Response({
            'status': response_status,
            'message': response_message,
            'data': response_data
        }, status=status_code)
    else:
        print(" -- here ")
        return Response({
            'status': response_status,
            'errors': response_message
        }, status=status_code)

