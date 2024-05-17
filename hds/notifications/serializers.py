# import serializers
from rest_framework import serializers

from common.serializers.userserializer import (
    UserCustomSerializer,
    UsernameSerializer,
)
from .models import Notification
from .utils import build_list_filter


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = ("creator",)

    def to_internal_value(self, data):
        request = self.context["request"]
        criteria = build_list_filter(request)
        trigger_on = data.get("trigger_on")
        recipients = data.get("recipients")
        notification = {
            "criteria": criteria,
            "trigger_on": trigger_on,
            "recipients": recipients,
            "creator": request.user.id,
        }
        return super().to_internal_value(notification)


class NotificationListSerializer(NotificationSerializer):
    """
    Return a response with minimal nesting to the list view
    """

    recipients = UsernameSerializer(many=True)

    class Meta(NotificationSerializer.Meta):
        pass


class NotificationDetailSerializer(NotificationSerializer):
    """
    This serializer return a response with full nesting to the detail view
    for any related objected.
    """

    recipients = UsernameSerializer(many=True)
    creator = UserCustomSerializer(read_only=True)
    modifiedBy = UserCustomSerializer(read_only=True)

    class Meta(NotificationSerializer.Meta):
        pass
