from django_filters.rest_framework import DjangoFilterBackend
from django.utils.decorators import method_decorator
from rest_framework import filters
from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer
from rest_framework.viewsets import ModelViewSet
from common.utils import make_ok, merge_nested_dict
from hds.roles import RoleChoices
from .renderers import HDSJSONRenderer
from .signals import report_created
from .decorators import cache_page_if_qp_exist


class CreateModelViewSet(ModelViewSet):
    renderer_classes = (HDSJSONRenderer,)
    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    view_permissions_update = {}
    action_serializers = {}
    view_permissions = {
            'create': {
                'admin': True, # Must whitelist permission below admin for creating
            },
            'list': {
                RoleChoices.SUPPORT: True,
                RoleChoices.JENKINS: True,
                RoleChoices.BEATBOX: True,
            },
            'retrieve': {
                RoleChoices.SUPPORT: True,
                RoleChoices.JENKINS: True,
                RoleChoices.BEATBOX: True,
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

    def get_serializer_class(self):
        """
        Return the class to use for the serializer.
        Defaults to using `self.serializer_class` for
        create, update & partial_update actions.
        """

        serializer = self.action_serializers.get(self.action)
        if serializer:
            return serializer
        return super().get_serializer_class()


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
            RoleChoices.BEATBOX: True,
        },
        'retrieve': {
            RoleChoices.SUPPORT: True,
            RoleChoices.JENKINS: True,
            RoleChoices.BEATBOX: True,
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
