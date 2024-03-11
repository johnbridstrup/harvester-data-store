from rest_framework import status
from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from common.renderers import HDSJSONRenderer
from common.utils import make_ok
from common.viewsets import CreateModelViewSet, ReportModelViewSet
from hds.roles import RoleChoices

from .models import Candidate, Grip, GripReport
from .filters import CandidateFilterset, GripFilterset, PickSessionReportFilterset
from .serializers.candidateserializers import CandidateFullSerializer, CandidateMinimalSerializer, CandidateFlattenedListSerializer
from .serializers.gripserializers import GripFullSerializer, GripMinimalSerializer, GripFlattenedListSerializer
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
    filterset_class = CandidateFilterset
    http_method_names = ["get", "head"]
    serializer_class = CandidateMinimalSerializer
    action_serializers = {
        "list": CandidateMinimalSerializer,
        "retrieve": CandidateFullSerializer,
        "full": CandidateFlattenedListSerializer,
    }
    view_permissions_update = {
        "full": {
            RoleChoices.SUPPORT: True,
        },
    }

    @action(
        detail=False, 
        methods=["get"], 
        url_path="full", 
        url_name="full",
        renderer_classes=[JSONRenderer]
    )
    def full(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        paginated_qs = self.paginate_queryset(qs)
        SerializerClass = self.get_serializer_class()
        if paginated_qs is not None:
            serializer = SerializerClass(paginated_qs, many=True, context={'request': request})
            paginated = self.get_paginated_response(serializer.data)
            return make_ok(f"Detailed candidate list", response_data=paginated.data)
        
        serializer = SerializerClass(qs, many=True)
        return make_ok(f"Detailed candidate list", response_data=serializer.data)


class GripView(CreateModelViewSet):
    queryset = Grip.objects.all()
    filterset_class = GripFilterset
    http_method_names = ["get", "head"]
    serializer_class = GripMinimalSerializer
    action_serializers = {
        "list": GripMinimalSerializer,
        "retrieve": GripFullSerializer,
        "full": GripFlattenedListSerializer,
    }
    view_permissions_update = {
        "full": {
            RoleChoices.SUPPORT: True,
        },
    }

    @action(
        detail=False, 
        methods=["get"], 
        url_path="full", 
        url_name="full",
        renderer_classes=[JSONRenderer]
    )
    def full(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        paginated_qs = self.paginate_queryset(qs)
        SerializerClass = self.get_serializer_class()
        if paginated_qs is not None:
            serializer = SerializerClass(paginated_qs, many=True, context={'request': request})
            paginated = self.get_paginated_response(serializer.data)
            return make_ok(f"Detailed grip list", response_data=paginated.data)
        
        serializer = SerializerClass(qs, many=True)
        return make_ok(f"Detailed grip list", response_data=serializer.data)
