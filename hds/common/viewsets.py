from rest_framework.viewsets import ModelViewSet


class CreateModelViewSet(ModelViewSet):
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)