# import serializers
from rest_framework import serializers

from .models import S3File
from event.serializers import EventSerializerMixin

import json


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
        data = {
            'key': key,
            'filetype': filetype,
            'UUID': UUID,
        }

        return super().to_internal_value(data)


class DirectUploadSerializer(EventSerializerMixin, serializers.ModelSerializer):
    file = serializers.FileField()
    class Meta:
        model = S3File
        fields = ('__all__')

    def save(self, **kwargs):
        inst = super().save(**kwargs)
        if inst.key is None:
            inst.key = inst.file.name
            inst.save()
        
        return inst
 