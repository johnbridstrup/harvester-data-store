from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
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
        data['related_objects'] = [
            *error_reports,
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
        data['event'] = event.id
      
        return super().to_internal_value(data)

    
    