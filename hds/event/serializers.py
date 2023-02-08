from collections import Iterable
from django.contrib.auth.models import User
from rest_framework import serializers
from taggit.serializers import TagListSerializerField
from .models import Event, PickSession

import logging


class TaggedUUIDSerializerBase(serializers.ModelSerializer):
    tags = TagListSerializerField(required=False, read_only=True)

    def related_objects(self):
        raise NotImplementedError(f"Must define related_objects property for {self.__class__}.")

    def has_related_files(self) -> bool:
        raise NotImplementedError(f"Must define has_related_files property for {self.__class__}")

    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        objs = []
        for rel_obj in self.related_objects():
            obj_set = getattr(instance, f"{rel_obj[0]}_set")
            objs.extend(self._related_object_list(obj_set, rel_obj[1], rel_obj[2]))
        data["related_objects"] = objs

        if self.has_related_files():
            s3files = [{'url': f.url(self.context.get('request', None)), 'filetype': f.filetype} for f in instance.s3file_set.all()]
            data['related_files'] = [
                *s3files,
            ]
        return data
    
    def _validate_related_obj_format(self):
        for rel_obj in self.related_objects():
            assert len(rel_obj) == 3, "Related object defintion should match [(model name, endpoint, type for response), ...]."

    @staticmethod
    def _related_object_list(obj_set, endpoint, object):
        return [
            {
                'url': f'/{endpoint}/{obj.id}/',
                'object': object,
            } 
        for obj in obj_set.all()]

    @staticmethod
    def get_or_create_uuid_tagged_obj(called_by, data, model, key):
        UUID = data.pop(key, model.generate_uuid())
        try:
            creator = called_by.context['request'].user
        except (KeyError, AttributeError):
            creator_id = data["creator"]
            creator = User.objects.get(id=creator_id)
        try:
            obj = model.objects.get(UUID=UUID)
        except model.DoesNotExist:
            obj = model.objects.create(UUID=UUID, creator=creator)

        try:
            obj.tags.add(called_by.Meta.model.__name__)
        except AttributeError:
            # The serializer either doesn't have a Meta class or a 
            # model associated with it.
            logging.exception(f"No Meta or model in {called_by.__class__.__name__}")
        
        return obj.id


class EventSerializer(TaggedUUIDSerializerBase):
    class Meta:
        model = Event
        fields = ('__all__')
        read_only_fields = ('creator',)
    
    def related_objects(self):
        return [
            ("errorreport", "errorreports", "Error Report"),
            ("gripreport", "gripreports", "Grip Report"),
            ("job", "jobs", "Job"),
            ("jobresults", "jobstatus", "Job Status"),
        ]
    
    def has_related_files(self) -> bool:
        return True


class PickSessionSerializer(TaggedUUIDSerializerBase):
    class Meta:
        model = PickSession
        fields = ('__all__')
        read_only_fields = ('creator',)

    def related_objects(self):
        return [
            ("errorreport", "errorreports", "Error Report"),
            ("autodiagnosticsreport", "autodiagnostics", "Autodiagnostics Report"),
            ("gripreport", "gripreports", "Grip Report"),
        ]

    def has_related_files(self) -> bool:
        return False


class EventSerializerMixin(serializers.Serializer):
    # Automatically serialize events in responses
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        event = EventSerializer(instance=instance.event)
        data['event'] = event.data
        return data
        
    def to_internal_value(self, data):
        data['event'] = TaggedUUIDSerializerBase.get_or_create_uuid_tagged_obj(self, data, Event, "UUID")
        return super().to_internal_value(data)


class PickSessionSerializerMixin(EventSerializerMixin): # Pick session uploads are also events
    def to_representation(self, instance):
        data = super().to_representation(instance)

        pick_session = PickSessionSerializer(instance=instance.pick_session)
        data['pick_session'] = pick_session.data
        return data

    def to_internal_value(self, data):
        data['pick_session'] = TaggedUUIDSerializerBase.get_or_create_uuid_tagged_obj(self, data, PickSession, "pick_session_uuid")

        return super().to_internal_value(data)
    