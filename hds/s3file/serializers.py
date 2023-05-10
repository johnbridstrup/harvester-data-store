# import serializers
import json
from django.contrib.auth.models import User
from rest_framework import serializers

from event.models import Event
from event.serializers import EventSerializerMixin, EventSerializer
from common.serializers.userserializer import UserCustomSerializer
from .models import S3File


class S3FileSerializer(EventSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = S3File
        fields = ('__all__')
        read_only_fields = ('creator',)

    @classmethod
    def get_filetype_uuid(cls, key):
        filetype = key.split('/')[-1].split('_')[0]
        UUID = key.split('_')[-1].split('.')[0]
        return filetype, UUID

    @classmethod
    def get_key(cls, event):
        event = json.loads(event['Body'])
        event = event['Records'][0]['s3']
        key = event['object']['key']
        return key

    def to_internal_value(self, data):
        key = self.get_key(data)

        # Uploaded filenames will need to be standardized.
        # This is assuming <filetype>_other_info_<UUID>.ext
        filetype, UUID = self.get_filetype_uuid(key)
        creator = self.context['request'].user
        event = self.get_or_create_event(UUID, creator, S3File.__name__)
        data = {
            'key': key,
            'filetype': filetype,
            'event': event.id,
        }
        return super().to_internal_value(data)


class S3FileListSerializer(S3FileSerializer):
    """
    Return a response with minimal nesting to the list view

    Exception:
        - event object is required here
    """

    event = EventSerializer(read_only=True)

    class Meta(S3FileSerializer.Meta):
        pass


class S3FileDetailSerializer(S3FileSerializer):
    """
    This serializer return a response with full nesting to the detail view
    for any related objected.
    """

    event = EventSerializer(read_only=True)
    creator = UserCustomSerializer(read_only=True)
    modifiedBy = UserCustomSerializer(read_only=True)

    class Meta(S3FileSerializer.Meta):
        pass


class DirectUploadSerializer(EventSerializerMixin, serializers.ModelSerializer):
    file = serializers.FileField()
    class Meta:
        model = S3File
        fields = ('__all__')

    def to_internal_value(self, data):
        try:
            creator = self.context['request'].user
        except KeyError:
            creator_id = data.get('creator')
            if not creator_id:
                raise serializers.ValidationError(f"Cannot determine creator for {self.__class__.__name__}")
            creator = User.objects.get(id=creator_id)
            data['creator'] = creator_id

        # This is all bad. We shouldn't need to create events for these files
        UUID = Event.generate_uuid()
        event = self.get_or_create_event(UUID, creator, S3File.__name__)
        data['event'] = event.id
        return super().to_internal_value(data)

    def save(self, **kwargs):
        inst = super().save(**kwargs)
        if inst.key is None:
            inst.key = inst.file.name
            inst.save()

        return inst
