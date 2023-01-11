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

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Connect related objects here
        error_reports = [
            {
                'url': f'/errorreports/{rep.id}/', 
                'object': 'Error Report'
            } for rep in instance.errorreport_set.all()
        ]

        jobs = [
            {
                'url': f'/jobs/{rep.id}/', 
                'object': 'Job'
            } for rep in instance.job_set.all()
        ] + [
            {
                'url': f'/jobstatus/{rep.id}/', 
                'object': 'Job Status'
            } for rep in instance.jobresults_set.all()
        ]
        data['related_objects'] = [
            *error_reports,
            *jobs,
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
        creator = self.context['request'].user
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

    
    