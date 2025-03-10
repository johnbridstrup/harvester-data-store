from ..filters import VersionFilterset
from ..models import HarvesterVersionReport
from ..serializers import HarvesterVersionReportSerializer

from common.viewsets import ReportModelViewSet
from common.schema import HDSToRepAutoSchema


class HarvesterVersionReportView(ReportModelViewSet):
    queryset = HarvesterVersionReport.objects.all()
    serializer_class = HarvesterVersionReportSerializer
    filterset_class = VersionFilterset
    schema = HDSToRepAutoSchema(
        extra_info={"conflicts": {"type": "string", "nullable": "true"}}
    )

    def get_queryset(self):
        listfilter = {}
        harv_id = self.request.query_params.get("harv_id", None)

        if harv_id is not None:
            listfilter["harvester__harv_id"] = harv_id

        return (
            HarvesterVersionReport.objects.filter(**listfilter)
            .order_by("-reportTime")
            .distinct()
        )
