from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.decorators import action
from rest_framework.renderers import JSONRenderer

from common.viewsets import CreateModelViewSet
from common.utils import make_ok
from hds.roles import RoleChoices

from .filters import AFTExceptionFilter
from .models import (
    AFTExceptionCode,
    AFTExceptionCodeManifest,
    AFTException
)
from .serializers import (
    AFTExceptionCodeSerializer,
    AFTExceptionCodeManifestSerializer,
    AFTExceptionSerializer,
    AFTExceptionListSerializer,
    AFTExceptionDetailSerializer,
    ParetoSerializer,
)
from .tasks import update_exception_codes
from .utils import create_pareto


class AFTExceptionCodeManifestView(CreateModelViewSet):
    queryset = AFTExceptionCodeManifest.objects.all()
    serializer_class = AFTExceptionCodeManifestSerializer
    view_permissions_update = {
        'create': {
            RoleChoices.JENKINS: True,
        }
    }

    def perform_create(self, serializer):
        super().perform_create(serializer)
        update_exception_codes.delay(serializer.data["id"], self.request.user.id)


class AFTExceptionCodeView(CreateModelViewSet):
    queryset = AFTExceptionCode.objects.all()
    serializer_class = AFTExceptionCodeSerializer


class AFTExceptionView(CreateModelViewSet):
    queryset = AFTException.objects.all()
    serializer_class = AFTExceptionSerializer
    filterset_class = AFTExceptionFilter
    view_permissions_update = {
        'pareto': {
            RoleChoices.SUPPORT: True
        }
    }
    action_serializers = {
        "list": AFTExceptionListSerializer,
        "retrieve": AFTExceptionDetailSerializer
    }

    @action(
        methods=['get'],
        url_path='pareto',
        detail=False,
        renderer_classes=[JSONRenderer],
    )
    @method_decorator(cache_page(60*20))
    def pareto(self, request):
        pareto_group = request.query_params.get("aggregate_query", "code__code")
        pareto_name = request.query_params.get("aggregate_name", None)
        qs = self.filter_queryset(self.get_queryset())
        query_set = create_pareto(qs, pareto_group)
        return make_ok(
            f"Pareto generated: {pareto_name if pareto_name else 'Exceptions'}",
            ParetoSerializer(query_set, many=True, new_name=pareto_name).data
        )
