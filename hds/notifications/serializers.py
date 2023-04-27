# import serializers
from rest_framework import serializers
from django.contrib.auth.models import User

from .models import Notification
from .utils import build_list_filter


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('__all__')
        read_only_fields = ('creator',)

    def to_representation(self, instance):
        notification = super().to_representation(instance)
        recipients = [User.objects.get(id=user).username for user in notification['recipients']]
        notification['recipients'] = recipients

        return notification

    def to_internal_value(self, data):
        request = self.context["request"]
        criteria = build_list_filter(request)
        trigger_on = data.get("trigger_on")
        recipients = data.get("recipients")
        notification = {
            "criteria": criteria,
            "trigger_on": trigger_on,
            "recipients": recipients,
            "creator": request.user.id
        }
        return super().to_internal_value(notification)