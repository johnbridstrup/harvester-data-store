from django.contrib.auth.models import User
from rest_framework import serializers
from taggit.serializers import TagListSerializerField
from .models import Event

import logging


class EventSerializer(serializers.ModelSerializer):
    tags = TagListSerializerField(required=False, read_only=True)
    class Meta:
        model = Event
        fields = ('__all__')
        read_only_fields = ('creator',)

    @staticmethod
    def _related_object_list(obj_set, endpoint, object):
        return [
            {
                'url': f'/{endpoint}/{obj.id}/',
                'object': object,
            } 
        for obj in obj_set.all()]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Connect related objects here
        error_reports = self._related_object_list(instance.errorreport_set, 'errorreports', 'Error Report')

        jobs = self._related_object_list(
            instance.job_set, 'jobs', 'Job'
        ) + self._related_object_list(
            instance.jobresults_set, 'jobstatus', 'Job Status'
        )

        grip_reports = self._related_object_list(instance.gripreport_set, 'gripreports', 'Grip Report')

        data['related_objects'] = [
            *error_reports,
            *jobs,
            *grip_reports,
        ]

        # Connect related files here
        s3files = [{'url': f.url(self.context.get('request', None)), 'filetype': f.filetype} for f in instance.s3file_set.all()]
        data['related_files'] = [
            *s3files,
        ]

        return data


class EventSerializerMixin(serializers.Serializer):
    # Automatically serialize events in responses
    def to_representation(self, instance):
        data = super().to_representation(instance)
        event = EventSerializer(instance.event).data
        data['event'] = event
        return data
        
    def to_internal_value(self, data):
        UUID = data.pop("UUID", Event.generate_uuid())
        try:
            creator = self.context['request'].user
        except (KeyError, AttributeError):
            creator_id = data["creator"]
            creator = User.objects.get(id=creator_id)
        try:
            event = Event.objects.get(UUID=UUID)
        except Event.DoesNotExist:
            event = Event.objects.create(UUID=UUID, creator=creator)

        try:
            event.tags.add(self.Meta.model.__name__)
        except AttributeError:
            # The serializer either doesn't have a Meta class or a 
            # model associated with it.
            logging.exception(f"No Meta or model in {self.__class__.__name__}")

        data['event'] = event.id
      
        return super().to_internal_value(data)

    
    