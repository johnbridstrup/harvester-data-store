from crypt import methods
from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer
from rest_framework.viewsets import ModelViewSet
from common.utils import make_ok
from .renderers import HDSJSONRenderer


class CreateModelViewSet(ModelViewSet):
    renderer_classes = (HDSJSONRenderer,)

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @classmethod
    def build_generic_query(cls, request):
        """builds generic query from params object

        Args:
            request (HttpRequest): The request that is
            initializing the query

        Returns:
            a dictionary of query params and values
        """
        query_filter = {}
        params = request.query_params.get('generic')
        if params is not None:
            for item in params.replace(' ', '').split(','):
                key, value = item.split('=')
                query_filter[key] = value
        return query_filter


class ReportModelViewSet(CreateModelViewSet):
    """ Viewset for error reports """
    @property
    def report_type(self):
        return self.serializer_class.report_type

    @action(
        methods=['get'],
        detail=False,
        url_path='getschema',
        renderer_classes=[JSONRenderer,]
    )
    def get_schema(self, request):
        schema = self.serializer_class.get_schema()
        msg = f"{self.report_type} schema retrieved"
        return make_ok(msg, schema)

