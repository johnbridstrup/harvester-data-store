from rest_framework import serializers
from taggit.serializers import TagListSerializerField

from harvester.serializers.harvesterserializer import HarvesterMinimalSerializer
from location.serializers.locationserializer import LocationMinimalSerializer
from common.serializers.userserializer import UserCustomSerializer

from .models import Event, PickSession


class TaggedUUIDSerializerBase(serializers.ModelSerializer):
    tags = TagListSerializerField(required=False, read_only=True)

    def related_objects(self):
        raise NotImplementedError(
            f"Must define related_objects property for {self.__class__}."
        )

    def has_related_files(self) -> bool:
        raise NotImplementedError(
            f"Must define has_related_files property for {self.__class__}"
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        objs = []
        for rel_obj in self.related_objects():
            obj_set = getattr(instance, f"{rel_obj[0]}_set")
            objs.extend(
                self._related_object_list(obj_set, rel_obj[1], rel_obj[2])
            )
        data["related_objects"] = objs

        if self.has_related_files():
            s3files = [
                {
                    "url": f.url(self.context.get("request", None), f.id),
                    "filetype": f.filetype,
                }
                for f in instance.s3file_set.all()
            ]
            images = [
                {
                    "url": f.file_url(self.context.get("request", None)),
                    "filetype": f.filetype,
                }
                for f in instance.s3file_set.all()
                if f.key is not None
                and f.key.endswith((".png", ".jpg", ".jpeg"))
            ]
            data["related_files"] = [
                *s3files,
            ]
            data["related_images"] = [*images]
        return data

    def _validate_related_obj_format(self):
        for rel_obj in self.related_objects():
            assert (
                len(rel_obj) == 3
            ), "Related object defintion should match [(model name, endpoint, type for response), ...]."

    @staticmethod
    def _related_object_list(obj_set, endpoint, object):
        return [
            {
                "url": f"/{endpoint}/{obj.id}/",
                "object": object,
            }
            for obj in obj_set.all()
        ]

    @staticmethod
    def get_or_create_uuid_tagged_obj(
        creator, uuid_model, model_tag, UUID=None
    ):
        try:
            obj = uuid_model.objects.get(UUID=UUID)
        except uuid_model.DoesNotExist:
            obj = uuid_model.objects.create(UUID=UUID, creator=creator)

        obj.tags.add(model_tag)

        return obj


class EventSerializer(TaggedUUIDSerializerBase):
    class Meta:
        model = Event
        fields = "__all__"
        read_only_fields = ("creator",)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        for event in instance.secondary_events.all():
            aux_ev_data = super().to_representation(event)
            data["related_objects"].extend(aux_ev_data["related_objects"])
            data["related_files"].extend(aux_ev_data["related_files"])
            data["related_images"].extend(aux_ev_data["related_images"])
        return data

    def related_objects(self):
        return [
            (
                "autodiagnosticsreport",
                "autodiagnostics",
                "Autodiagnostics Report",
            ),
            ("errorreport", "errorreports", "Error Report"),
            ("gripreport", "gripreports", "Grip Report"),
            ("job", "jobs", "Job"),
            ("jobresults", "jobstatus", "Job Status"),
            ("harvesterassetreport", "harvassetreport", "Asset Report"),
            ("logsession", "logfiles", "LogSession"),
        ]

    def has_related_files(self) -> bool:
        return True


class PickSessionSerializer(TaggedUUIDSerializerBase):
    class Meta:
        model = PickSession
        fields = "__all__"
        read_only_fields = ("creator",)

    def related_objects(self):
        return [
            ("errorreport", "errorreports", "Error Report"),
            (
                "autodiagnosticsreport",
                "autodiagnostics",
                "Autodiagnostics Report",
            ),
            ("gripreport", "gripreports", "Grip Report"),
            ("harvesterassetreport", "harvassetreport", "Asset Report"),
        ]

    def has_related_files(self) -> bool:
        return False


class EventSerializerMixin(serializers.Serializer):
    @classmethod
    def serialize_event(cls, event):
        return EventSerializer(instance=event).data

    @classmethod
    def get_or_create_event(cls, event_uuid, creator, tag):
        return TaggedUUIDSerializerBase.get_or_create_uuid_tagged_obj(
            creator, Event, tag, event_uuid
        )


class PickSessionSerializerMixin(
    EventSerializerMixin
):  # Pick session uploads are also events
    @classmethod
    def serialize_picksession(cls, picksession):
        return PickSessionSerializer(instance=picksession).data

    @classmethod
    def get_or_create_picksession(cls, ps_uuid, creator, tag):
        return TaggedUUIDSerializerBase.get_or_create_uuid_tagged_obj(
            creator, PickSession, tag, ps_uuid
        )

    @classmethod
    def set_picksess_harv_location(cls, picksess, harv):
        if picksess.harvester is not None:
            return
        picksess.harvester = harv
        picksess.location = harv.location
        picksess.save()

    @classmethod
    def set_picksess_time(cls, picksess, start_time, end_time):
        picksess.start_time = start_time
        picksess.session_length = end_time - start_time
        picksess.save()


class PickSessionDetailSerializer(PickSessionSerializer):
    """
    Return a response with full nesting to the detail view
    for any related objected.
    """

    harvester = HarvesterMinimalSerializer(read_only=True)
    location = LocationMinimalSerializer(read_only=True)
    creator = UserCustomSerializer(read_only=True)
    modifiedBy = UserCustomSerializer(read_only=True)

    class Meta(PickSessionSerializer.Meta):
        pass


class PickSessionMinimalSerializer(PickSessionSerializer):
    harvester = HarvesterMinimalSerializer(read_only=True)
    location = LocationMinimalSerializer(read_only=True)

    class Meta:
        model = PickSession
        fields = (
            "UUID",
            "start_time",
            "session_length",
            "harvester",
            "location",
        )
