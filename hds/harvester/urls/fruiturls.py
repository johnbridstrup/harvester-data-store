from rest_framework import routers
from ..views.fruitview import FruitView
from django.urls import path


router = routers.SimpleRouter()

urlpatterns = [
  path('', FruitView.as_view(), name="fruits"),
]
