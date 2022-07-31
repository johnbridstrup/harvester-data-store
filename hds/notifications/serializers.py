# import serializers
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    def to_internal_value(self, data):
        trigger_on = data["trigger_on"]
        recipients = data["recipients"]
        data = {
            "trigger_on": trigger_on,
            "recipients": recipients,
            "criteria": self.context["request"].query_params.dict()
        }
        return super().to_internal_value(data)

    def to_representation(self, instance):
        notification = super().to_representation(instance)
        recipients = [User.objects.get(id=user).username for user in notification['recipients']]
        notification['recipients'] = recipients

        return notification
    class Meta:
        model = Notification
        fields = ('__all__')
        read_only_fields = ('creator',)