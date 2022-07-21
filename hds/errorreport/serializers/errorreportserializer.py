from common.serializers.reportserializer import ReportSerializerBase
from ..models import ErrorReport
from harvester.models import Harvester
from exceptions.serializers import AFTExceptionSerializer


class ErrorReportSerializer(ReportSerializerBase):
    """Serializer for the ErrorReport model"""

    def to_internal_value(self, data):
        report = data.copy()
        harv_id = int(report['data']['sysmon_report']['serial_number'])
        harvester = Harvester.objects.get(harv_id=harv_id)
        reportTime = self.extract_timestamp(report['timestamp'])

        data = {
            'harvester': harvester.id,
            'location': harvester.location.id,
            'reportTime': reportTime,
            'report': report
        }
        return super().to_internal_value(data)

    @classmethod
    def _extract_exception_data(cls, sysmon_report):
        errors = []
        for sysdict in sysmon_report.values():
            if "errors" in sysdict:
                for serv, errdict in sysdict['errors'].items():
                    service, index = serv.split('.')
                    node = sysdict.get('robot_index', index)
                    code = errdict.get('code', 0)
                    timestamp = cls.extract_timestamp(errdict.get('ts'))
                    traceback = errdict.get('traceback', 'No Traceback Available')
                    errors.append(
                        {
                            "code": code,
                            "service": service,
                            "node": node,
                            "traceback": traceback,
                            "timestamp": timestamp
                        }
                    )
        return errors

    class Meta:
        model = ErrorReport
        fields = ('__all__')
        read_only_fields = ('creator',)

