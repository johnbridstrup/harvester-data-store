from rest_framework import serializers
from .models import Event

import uuid


class EventSerializerMixin(serializers.Serializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['event_uuid'] = instance.event.UUID
        return data
        
    def to_internal_value(self, data):
        UUID = data.pop("UUID", Event.generate_uuid())
        creator = self.context['request'].user
        event = Event.objects.get_or_create(UUID=UUID, creator=creator)[0]
        data['event'] = event.id
        return super().to_internal_value(data)

    
    