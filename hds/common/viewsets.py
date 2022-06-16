from rest_framework.viewsets import ModelViewSet
from uritemplate import partial
from errorreport.models import ErrorReport
from .renderers import HDSJSONRenderer
from rest_framework.response import Response


class CreateModelViewSet(ModelViewSet):
    renderer_classes = (HDSJSONRenderer,)
    
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class ReportModelViewSet(ModelViewSet):

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(creator=self.request.user)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.update(serializer.instance, serializer.validated_data)
        return Response(serializer.data)
