from django.db.models import Prefetch

from common.viewsets import ReportModelViewSet
from exceptions.models import AFTException
from harvester.models import Harvester
from location.models import Location
from event.models import Event, PickSession

from ..filters import ErrorReportFilterset
from ..models import ErrorReport
from ..metrics import (
    ERRORREPORT_LIST_QUERY_TIMER,
)
from ..serializers.errorreportserializer import (
    ErrorReportSerializer,
    ErrorReportListSerializer,
    ErrorReportDetailSerializer,
)
from ..tasks import extract_exceptions_and_notify


class ErrorReportView(ReportModelViewSet):
    queryset = ErrorReport.objects.all()
    serializer_class = ErrorReportSerializer
    filterset_class = ErrorReportFilterset
    action_serializers = {
        "list": ErrorReportListSerializer,
        "retrieve": ErrorReportDetailSerializer,
    }

    def perform_create(self, serializer):
        super().perform_create(serializer)
        report_id = serializer.data["id"]
        beatbox_request = self.request.query_params.get(
            "is_beatbox_request", None
        )
        extract_exceptions_and_notify.delay(report_id, beatbox_request)

    @ERRORREPORT_LIST_QUERY_TIMER.time()
    def get_queryset(self):
        if self.action == "list":
            return (
                ErrorReport.objects.prefetch_related(
                    Prefetch(
                        lookup="exceptions",
                        queryset=AFTException.objects.select_related("code"),
                    ),
                    Prefetch(
                        lookup="harvester",
                        queryset=Harvester.objects.prefetch_related(
                            Prefetch(
                                lookup="location",
                                queryset=Location.objects.select_related(
                                    "distributor"
                                ),
                            )
                        ).select_related("fruit", "release"),
                    ),
                    Prefetch(
                        lookup="location",
                        queryset=Location.objects.select_related("distributor"),
                    ),
                    "tags",
                )
                .order_by("-reportTime")
                .distinct()
            )
        elif self.action == "retrieve":
            return ErrorReport.objects.prefetch_related(
                Prefetch(
                    lookup="exceptions",
                    queryset=AFTException.objects.select_related("code"),
                ),
                Prefetch(
                    lookup="harvester",
                    queryset=Harvester.objects.prefetch_related(
                        Prefetch(
                            lookup="location",
                            queryset=Location.objects.select_related(
                                "distributor"
                            ),
                        )
                    ).select_related("fruit", "release"),
                ),
                Prefetch(
                    lookup="location",
                    queryset=Location.objects.select_related("distributor"),
                ),
                Prefetch(
                    lookup="event",
                    queryset=Event.objects.prefetch_related(
                        "s3file_set",
                        "secondary_events",
                    ),
                ),
                Prefetch(
                    lookup="pick_session",
                    queryset=PickSession.objects.prefetch_related(
                        Prefetch(
                            lookup="harvester",
                            queryset=Harvester.objects.prefetch_related(
                                Prefetch(
                                    lookup="location",
                                    queryset=Location.objects.select_related(
                                        "distributor"
                                    ),
                                )
                            ).select_related("fruit", "release"),
                        ),
                        Prefetch(
                            lookup="location",
                            queryset=Location.objects.select_related(
                                "distributor"
                            ),
                        ),
                    ),
                ),
                "tags",
            ).select_related("creator", "modifiedBy")
        return super().get_queryset()
