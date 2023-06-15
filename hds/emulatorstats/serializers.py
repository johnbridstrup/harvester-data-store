from taggit.serializers import TaggitSerializer, TagListSerializerField

from common.serializers.reportserializer import ReportSerializerBase
from event.serializers import EventSerializerMixin
from .models import EmustatsReport

class EmustatsReportSerializer(TaggitSerializer, EventSerializerMixin, ReportSerializerBase):
    tags = TagListSerializerField()

    M_TO_MM = 1000
    HR_TO_SEC = 3600

    class Meta:
        model = EmustatsReport
        fields = ('__all__')
        read_only_fields = ('creator',)

    def to_internal_value(self, data):
        report = data.copy()
        data, _ = self.extract_basic(report)
        UUID = self.extract_uuid(report)
        creator = self.get_user_from_request()
        event = self.get_or_create_event(UUID, creator, EmustatsReport.__name__)
        data['event'] = event.id

        data = {
            **data,
            **report["data"],
        }

        # Change tag to tags
        if data.get("tag") is not None:
            data["tags"] = data["tag"]
        else:
            data["tags"] = data.get("tags", [])

        # LEGACY STUFF
        if data.get("elapsed_hours") is not None:
            data["elapsed_seconds"] = self.HR_TO_SEC * data.pop("elapsed_hours")

        if data.get("meters_traveled") is not None:
            data["mm_traveled"] = self.M_TO_MM * data.pop("meters_traveled")

        if data.get("num_berry_collisions") is not None:
            data["num_fruit_collisions"] = data.pop("num_berry_collisions")

        if data.get("num_apple_collisions") is not None:
            data["num_fruit_collisions"] = data.pop("num_apple_collisions")

        if data.get("num_type_1_errors") is not None:
            data["num_false_ripe"] = data.pop("num_type_1_errors")

        if data.get("num_type_2_errors") is not None:
            data["num_false_unripe"] = data.pop("num_type_2_errors")

        return super().to_internal_value(data)