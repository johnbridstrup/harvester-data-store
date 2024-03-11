from rest_framework import status
from rest_framework.response import Response

from common.renderers import HDSJSONRenderer
from common.viewsets import CreateModelViewSet, ReportModelViewSet
from hds.roles import RoleChoices

from .models import Candidate, Grip, GripReport
from .filters import PickSessionReportFilterset
from .serializers.candidateserializers import CandidateFullSerializer, CandidateMinimalSerializer
from .serializers.gripserializers import GripFullSerializer, GripMinimalSerializer
from .serializers.gripreportserializers import (
    GripReportSerializer,
    GripReportDetailSerializer,
    GripReportListSerializer,
)
from .tasks import download_gripreport, extract_grip_report


class GripReportView(ReportModelViewSet):
    queryset = GripReport.objects.all()
    serializer_class = GripReportSerializer
    filterset_class = PickSessionReportFilterset
    action_serializers = {
        "retrieve": GripReportDetailSerializer,
        "list": GripReportListSerializer,
    }

    def create(self, request, *args, **kwargs):
        event = request.data
        download_gripreport.apply_async(args=(event, request.user.id), link=extract_grip_report.s())
        return Response(status=status.HTTP_202_ACCEPTED)
    

class CandidateView(CreateModelViewSet):
    queryset = Candidate.objects.all()
    http_method_names = ["get", "head"]
    serializer_class = CandidateMinimalSerializer
    action_serializers = {
        "list": CandidateMinimalSerializer,
        "retrieve": CandidateFullSerializer,
    }
    view_permissions_update = {
        "full": {
            RoleChoices.SUPPORT: True,
        },
    }


class GripView(CreateModelViewSet):
    queryset = Grip.objects.all()
    http_method_names = ["get", "head"]
    serializer_class = GripMinimalSerializer
    action_serializers = {
        "list": GripMinimalSerializer,
        "retrieve": GripFullSerializer,
    }
    view_permissions_update = {
        "full": {
            RoleChoices.SUPPORT: True,
        },
    }
