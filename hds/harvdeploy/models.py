from common.models import CommonInfo
from harvester.models import Fruit

from django.db import models


class HarvesterCodeRelease(CommonInfo):
    version = models.CharField(max_length=40)
    release = models.JSONField()
    fruit = models.ForeignKey(Fruit, on_delete=models.CASCADE)
