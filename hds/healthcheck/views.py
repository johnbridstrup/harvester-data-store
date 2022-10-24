from collections import OrderedDict

from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings

from .checks.db import check as db_check
from .checks.host import check as host_check


class HealthCheckView(APIView):

    def get(self, request, *args, **kwargs):
        response = OrderedDict()
        response['status'] = 'online'
        response['debug'] = settings.DEBUG

        response['host'] = host_check(request)
        response['dbs'] = db_check(request)

        return Response(data=response, status=200)
