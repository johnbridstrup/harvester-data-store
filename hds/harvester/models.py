from django.db import models
from simple_history.models import HistoricalRecords
from location.models import Location
from common.models import CommonInfo


class Fruit(CommonInfo):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class Harvester(CommonInfo):
    harv_id = models.IntegerField()
    fruit = models.ForeignKey(Fruit, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, blank=True, null=True, unique=True)
    is_emulator = models.BooleanField(default=False)
    release = models.ForeignKey(
        "harvdeploy.HarvesterCodeRelease",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
    )
    history = HistoricalRecords()
    thingName = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(
                fields=[
                    "harv_id",
                ]
            ),
            models.Index(
                fields=[
                    "is_emulator",
                ]
            ),
        ]

    @property
    def version_history(self):
        return self.harvesterversionreport_set

    def save(self, *args, **kwargs):
        if self.is_emulator:
            try:
                # This is a hack to get around having overlapping harv ids on
                # swemus and gpus. We can only create one emulator per fruit so
                # we can get that emulator without a harv ID.
                harv = Harvester.objects.get(fruit=self.fruit, is_emulator=True)
                if (
                    harv.id != self.id
                ):  # Alow updating emulator but not creating duplicate
                    raise ValueError(f"There can only be one {self.fruit} emulator")
            except Harvester.DoesNotExist:
                pass
        super(Harvester, self).save(*args, **kwargs)

    def __str__(self):
        return self.name

    def current_version(self, before=None):
        if before is not None:
            return self.version_history.filter(reportTime__lte=before).latest(
                "reportTime"
            )
        else:
            return self.version_history.latest("reportTime")

    def has_asset(self, asset_type, serial_number):
        asset_list = self.assets.filter(
            asset__name=asset_type, serial_number=serial_number
        )
        return len(asset_list) >= 1
