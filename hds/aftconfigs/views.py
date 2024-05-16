from django.db.models import Prefetch

from common.viewsets import ReportModelViewSet
from harvester.models import Harvester
from location.models import Location
from event.models import Event

from .models import ConfigReport
from .serializers import ConfigReportSerializer, ConfigReportDetailSerializer


class ConfigReportView(ReportModelViewSet):
    queryset = ConfigReport.objects.all()
    serializer_class = ConfigReportSerializer
    filterset_fields = (
        "harvester__harv_id",
        "event__UUID",
        "location__ranch",
    )
    action_serializers = {"retrieve": ConfigReportDetailSerializer}

    def get_queryset(self):
        if self.action == "retrieve":
            return ConfigReport.objects.prefetch_related(
                Prefetch(
                    lookup="harvester",
                    queryset=Harvester.objects.prefetch_related(
                        Prefetch(
                            lookup="location",
                            queryset=Location.objects.select_related("distributor"),
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
            ).select_related("creator", "modifiedBy")
        return super().get_queryset()
