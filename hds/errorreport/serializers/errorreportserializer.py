from common.serializers.reportserializer import ReportSerializerBase
from ..models import ErrorReport
from harvester.models import Harvester
from harvester.serializers.harvesterserializer import HarvesterSerializer
from location.serializers.locationserializer import LocationSerializer
from event.models import Event
from event.serializers import EventSerializerMixin
from exceptions.models import AFTException, AFTExceptionCode
from exceptions.serializers import AFTExceptionSerializer
from rest_framework import serializers


NO_TRACEBACK_STR = 'No Traceback Available (HDS)'
NO_VALUE_STR = 'No Value Available (HDS)'


class ErrorReportSerializer(EventSerializerMixin, ReportSerializerBase):
    """Serializer for the ErrorReport model"""
    exceptions = AFTExceptionSerializer(many=True, required=False)

    def create(self, validated_data):
        report_inst = super().create(validated_data)
        self.create_exceptions(report_inst)      
        return report_inst

    def to_representation(self, instance):
        data = super().to_representation(instance)
        harv_data = HarvesterSerializer(instance.harvester).data
        location_data = LocationSerializer(instance.location).data
        data['location'] = location_data
        data['harvester'] = harv_data
        return data

    def to_internal_value(self, data):
        report = data.copy()
        harv_id = int(report['data']['sysmon_report']['serial_number'])
        harvester = self.get_harvester(harv_id, report['data']['sysmon_report'])
        reportTime = self.extract_timestamp(report['timestamp'])
        UUID = report['data'].get("uuid", Event.generate_uuid())
        data = {
            'harvester': harvester.id,
            'location': harvester.location.id,
            'reportTime': reportTime,
            'report': report,
            'UUID': UUID,
        }
        return super().to_internal_value(data)

    @classmethod
    def _extract_exception_data(cls, sysmon_report):
        errors = []
        for key, sysdict in sysmon_report.items():
            if "sysmon" in key and "errors" in sysdict:
                for serv, errdict in sysdict['errors'].items():
                    service, index = serv.split('.')
                    robot = sysdict.get('robot_index', index)
                    node = sysdict.get('index', 0)
                    code = errdict.get('code', 0)
                    timestamp = cls.extract_timestamp(errdict.get('ts'))
                    traceback = errdict.get('traceback', NO_TRACEBACK_STR)
                    info = errdict.get('value', NO_VALUE_STR)
                    errors.append(
                        {
                            "code": code,
                            "service": service,
                            "node": node,
                            "robot": robot,
                            "traceback": traceback,
                            "info": info,
                            "timestamp": timestamp,
                        }
                    )
        return errors

    @classmethod
    def create_exceptions(cls, report, user=None):
        errors = cls._extract_exception_data(report.report['data']['sysmon_report'])
        if user:
            creator = user
        else:
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


class ParetoSerializer(serializers.Serializer):
    # Turns queryset into data with value and count
    value = serializers.CharField() # Can be int or str
    count = serializers.IntegerField()

    def __init__(self, instance=None, data=..., new_name=None, **kwargs):
        super().__init__(instance, data, **kwargs)
        self.new_name=new_name

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if self.new_name is not None:
            data[f"{self.new_name}"] = data.pop("value")

        return data

   