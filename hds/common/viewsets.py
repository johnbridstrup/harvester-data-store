from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer
from rest_framework.viewsets import ModelViewSet
from common.utils import make_ok, merge_nested_dict
from hds.roles import RoleChoices
from .renderers import HDSJSONRenderer
from .signals import report_created


class CreateModelViewSet(ModelViewSet):
    renderer_classes = (HDSJSONRenderer,)
    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    view_permissions_update = {}
    view_permissions = {
            'create': {
                'admin': True, # Must whitelist permission below admin for creating
            },  
            'list': {
                RoleChoices.SUPPORT: True,
                RoleChoices.JENKINS: True,
            },
            'retrieve': {
                RoleChoices.SUPPORT: True,
                RoleChoices.JENKINS: True,
            },
            'destroy': {
                'admin': True,
            },
            'update': {
                'admin': True,
            },
            'partial_update': {
                'admin': True,
            }
        }

    def __init__(self, **kwargs):
        self.view_permissions = merge_nested_dict(self.view_permissions, self.view_permissions_update, overwrite_none=True)
        super().__init__(**kwargs)

    def perform_create(self, serializer):
        return serializer.save(creator=self.request.user)

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
    ordering = ('-reportTime',)
    view_permissions = {
        'create': {
            'admin': True,
            RoleChoices.SQS: True,
        },  
        'list': {
            RoleChoices.SUPPORT: True,
            RoleChoices.JENKINS: True,
        },
        'retrieve': {
            RoleChoices.SUPPORT: True,
            RoleChoices.JENKINS: True,
        },
        'destroy': {
            'admin': True,
        },
        'update': {
            'admin': True,
        },
        'partial_update': {
            'admin': True,
        },
        'get_schema': {
            RoleChoices.SUPPORT: True,
            RoleChoices.JENKINS: True,
            RoleChoices.SQS: True,
        },
    }

    def perform_create(self, serializer):
        inst = super().perform_create(serializer)
        app_label = inst._meta.app_label
        class_name = inst.__class__.__name__
        report_created.send(sender=class_name, app_label=app_label, pk=inst.id)
        return inst
    
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
        schema = self.serializer_class().get_schema()
        msg = f"{self.report_type} schema retrieved"
        return make_ok(msg, schema)
