import os

from rest_framework import status
from rest_framework.response import Response
from common.S3Event import S3EventObject
from common.viewsets import CreateModelViewSet
from harvester.models import Harvester
from .models import ChatbotLog
from .serializers import ChatbotLogSerializer
from .tasks import send_to_slack


class ChatbotLogViewSet(CreateModelViewSet):
    queryset = ChatbotLog.objects.all()
    serializer_class = ChatbotLogSerializer

    IMAGE_FTYPES = ["jpg", "jpeg", "png"]

    def _get_filetype(self, key: str):
        ext = os.path.splitext(key)[1].strip(".")
        if ext in self.IMAGE_FTYPES:
            return ChatbotLog.ChatbotLogType.IMAGE
        if ext == "json":
            return ChatbotLog.ChatbotLogType.MESSAGE
        raise ValueError(f"Invalid filetype: {ext}")

    def create(self, request, *args, **kwargs):
        s3_event = S3EventObject(request.data)
        for record in s3_event.records:
            filetype = self._get_filetype(record.key)
            harv_id = record.harv_id
            harvester = Harvester.objects.filter(harv_id=harv_id)
            if len(harvester) > 1:
                raise ValueError(f"Multiple harvesters found for {harv_id}")
            elif len(harvester) == 0:
                raise ValueError(f"No harvester found for {harv_id}")
            harvester = harvester.first()

            data = {
                "creator": request.user.id,
                "harvester": harvester.id,
                "s3event": s3_event.event,
            }
            if filetype == ChatbotLog.ChatbotLogType.IMAGE:
                data["type"] = ChatbotLog.ChatbotLogType.IMAGE
            elif filetype == ChatbotLog.ChatbotLogType.MESSAGE:
                data["type"] = ChatbotLog.ChatbotLogType.MESSAGE
            else:
                raise ValueError(f"Invalid filetype: {filetype}")

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            send_to_slack.delay(serializer.instance.id)
        headers = self.get_success_headers(serializer.data)
        return Response(status=status.HTTP_201_CREATED, headers=headers)
