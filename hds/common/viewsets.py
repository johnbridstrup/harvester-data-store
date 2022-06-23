from rest_framework.viewsets import ModelViewSet
from .renderers import HDSJSONRenderer


class CreateModelViewSet(ModelViewSet):
    renderer_classes = (HDSJSONRenderer,)
    
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class ReportModelViewSet(CreateModelViewSet):
    """ Viewset for error reports """
    pass
