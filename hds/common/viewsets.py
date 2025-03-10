from django.contrib.admin.models import LogEntry, ADDITION, CHANGE, DELETION
from django.contrib.contenttypes.models import ContentType
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.decorators import method_decorator
from django.utils.translation import gettext as _
from rest_framework import filters
from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from admin_utils.metrics import AdminMetrics
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
        "create": {
            "admin": True,  # Must whitelist permission below admin for creating
            RoleChoices.SQS: True,
        },
        "list": {
            RoleChoices.SUPPORT: True,
            RoleChoices.JENKINS: True,
            RoleChoices.BEATBOX: True,
        },
        "retrieve": {
            RoleChoices.SUPPORT: True,
            RoleChoices.JENKINS: True,
            RoleChoices.BEATBOX: True,
        },
        "destroy": {
            "admin": True,
        },
        "update": {
            "admin": True,
        },
        "partial_update": {
            "admin": True,
        },
    }

    def __init__(self, **kwargs):
        self.view_permissions = merge_nested_dict(
            self.view_permissions,
            self.view_permissions_update,
            overwrite_none=True,
        )
        super().__init__(**kwargs)

    def perform_create(self, serializer):
        inst = serializer.save(creator=self.request.user)
        self._log_on_create(serializer)
        return inst

    def perform_update(self, serializer):
        """Update the instance and log the updated data."""
        inst = serializer.save(modifiedBy=self.request.user)
        self._log_on_update(serializer)
        return inst

    def perform_destroy(self, instance):
        """Delete the instance and log the deletion."""
        self._log_on_destroy(instance)
        instance.delete()

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

    def log(self, operation, instance):
        if operation == ADDITION:
            msg = "Created"
        if operation == CHANGE:
            msg = "Updated"
        if operation == DELETION:
            msg = "Deleted"
        action_message = _(msg)

        AdminMetrics.incr_crud_operation(
            model=instance.__class__.__name__,
            operation=operation,
            user=self.request.user.username,
        )
        LogEntry.objects.log_action(
            user_id=self.request.user.id,
            content_type_id=ContentType.objects.get_for_model(instance).pk,
            object_id=instance.pk,
            object_repr=str(instance),
            action_flag=operation,
            change_message=action_message + " " + str(instance),
        )

    def _log_on_create(self, serializer):
        """Log the up-to-date serializer.data."""
        self.log(operation=ADDITION, instance=serializer.instance)

    def _log_on_update(self, serializer):
        """Log data from the updated serializer instance."""
        self.log(operation=CHANGE, instance=serializer.instance)

    def _log_on_destroy(self, instance):
        """Log data from the instance before it gets deleted."""
        self.log(operation=DELETION, instance=instance)


class ReportModelViewSet(CreateModelViewSet):
    """Viewset for error reports"""

    ordering = ("-reportTime",)
    view_permissions = {
        "create": {
            "admin": True,
            RoleChoices.SQS: True,
        },
        "list": {
            RoleChoices.SUPPORT: True,
            RoleChoices.JENKINS: True,
            RoleChoices.BEATBOX: True,
        },
        "retrieve": {
            RoleChoices.SUPPORT: True,
            RoleChoices.JENKINS: True,
            RoleChoices.BEATBOX: True,
        },
        "destroy": {
            "admin": True,
        },
        "update": {
            "admin": True,
        },
        "partial_update": {
            "admin": True,
        },
        "get_schema": {
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
        methods=["get"],
        detail=False,
        url_path="getschema",
        renderer_classes=[
            JSONRenderer,
        ],
    )
    def get_schema(self, request):
        schema = self.serializer_class().get_schema()
        msg = f"{self.report_type} schema retrieved"
        return make_ok(msg, schema)


####################################################################################################
# Mixins
####################################################################################################


class CountActionMixin(ModelViewSet):
    @action(
        detail=False,
        methods=["get"],
        url_path="count",
        url_name="count",
        renderer_classes=[JSONRenderer],
    )
    def count(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        count = qs.count()
        return make_ok(
            f"Count of {self.serializer_class.Meta.model.__name__}",
            response_data={"count": count},
        )


class AdminActionMixin(ModelViewSet):
    def action_items(self) -> list:
        """
        Provide a list action items that needs to be implemented as part of the
        actions endpoint input query params.

        Returns:
            a list of actions
        """
        raise NotImplementedError(
            "action items should be provided for this view"
        )

    @action(
        methods=["get"],
        detail=False,
        url_name="actionitems",
        url_path="actionitems",
        renderer_classes=[JSONRenderer],
    )
    def action_item_view(self, request):
        return make_ok(
            "successfully retrieved actions items", self.action_items()
        )

    def run_actions(self, request) -> Response:
        """
        Implements the view's logic and return response to client
        """

        raise NotImplementedError("View's logic should be implemented!")
