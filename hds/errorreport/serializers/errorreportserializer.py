from common.serializers.reportserializer import ReportSerializerBase
from ..models import ErrorReport
from harvester.models import Harvester
from exceptions.models import AFTException, AFTExceptionCode
from exceptions.serializers import AFTExceptionSerializer


class ErrorReportSerializer(ReportSerializerBase):
    """Serializer for the ErrorReport model"""
    exceptions = AFTExceptionSerializer(many=True, required=False)

    def create(self, validated_data):
        report_inst = super().create(validated_data)
        self.create_exceptions(report_inst)      
        return report_inst

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

    @classmethod
    def create_exceptions(cls, report):
        errors = cls._extract_exception_data(report.report['data']['sysmon_report'])
        creator = report.creator
        if errors is not None:
            for error in errors:
                error['report'] = report
                error['timestamp'] = error['timestamp']
                error['code'] = AFTExceptionCode.objects.get(code=error['code'])
                AFTException.objects.create(**error, creator=creator)


    class Meta:
        model = ErrorReport
        fields = ('__all__')
        read_only_fields = ('creator',)

