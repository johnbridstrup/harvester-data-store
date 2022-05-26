from collections import OrderedDict

from rest_framework.views import APIView
from rest_framework.response import Response

from .checks.db import check as db_check


class HealthCheckView(APIView):

    def get(self, request, *args, **kwargs):
        response = OrderedDict()
        response['status'] = 'online'

        response['dbs'] = db_check(request)

        return Response(data=response, status=200)
