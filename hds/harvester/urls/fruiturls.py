from rest_framework import routers
from ..views.fruitview import FruitView


router = routers.SimpleRouter()
router.register(r'', FruitView, basename="fruit")

urlpatterns = [
] + router.urls
