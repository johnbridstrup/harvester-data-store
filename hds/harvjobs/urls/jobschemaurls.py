from rest_framework import routers
from ..views.jobschemaviews import JobSchemaView


router = routers.SimpleRouter()
router.register(r"", JobSchemaView, basename="jobschema")

urlpatterns = [] + router.urls
