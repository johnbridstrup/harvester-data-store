from .models import Notification
from .serializers import NotificationSerializer

from rest_framework.permissions import IsAuthenticated
from common.viewsets import CreateModelViewSet


class NotificationView(CreateModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    http_method_names = ['get', 'delete']

    def get_queryset(self):
        filter_dict = {}

        # get category from request
        query_param = self.request.query_params.get('category')

        # filter queryset for created
        if query_param == "created":
            filter_dict['creator'] = self.request.user

        # filter queryset for is_recipient
        if query_param == "is_recipient":
            filter_dict["recipients__in"] = [self.request.user]

        # return queryset
        return self.queryset.filter(**filter_dict).order_by('-id').distinct()
