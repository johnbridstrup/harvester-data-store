from django.db import models
from location.models import Location
from common.models import CommonInfo


class Fruit(CommonInfo):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Harvester(CommonInfo):
    harv_id = models.IntegerField()
    fruit = models.ForeignKey(Fruit, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name
