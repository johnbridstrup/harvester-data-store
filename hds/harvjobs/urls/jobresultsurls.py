from rest_framework import routers
from ..views.jobresultsviews import JobResultsView


router = routers.SimpleRouter()
router.register(r"", JobResultsView, basename="jobresults")

urlpatterns = [] + router.urls
