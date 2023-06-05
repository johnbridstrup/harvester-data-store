from django.db import models
from taggit.managers import TaggableManager
from taggit.models import TaggedItemBase

from common.reports import ReportBase
from event.models import PickSessionModelMixin


class EmustatsReport(PickSessionModelMixin, ReportBase):
    scene = models.CharField(max_length=127)
    branch = models.CharField(max_length=127)
    date = models.CharField(max_length=31)
    runner = models.CharField(max_length=63, null=True, blank=True)

    elapsed_seconds = models.FloatField()
    mm_traveled = models.FloatField()

    num_grip_attempts = models.IntegerField()
    grip_success_percentage = models.FloatField(null=True, blank=True)

    num_pick_attempts = models.IntegerField()
    pick_success_percentage = models.FloatField(null=True, blank=True)
    thoroughness_percentage = models.FloatField(null=True, blank=True)

    detection_success_percentage = models.FloatField(null=True, blank=True)
    num_cand_overlaps = models.IntegerField()
    rmse_localization_mm = models.FloatField()

    num_fruit_collisions = models.IntegerField()
    num_leaf_collisions = models.IntegerField()
    num_bed_collisions = models.IntegerField()

    num_pick_cands = models.IntegerField()
    num_no_pick_cands = models.IntegerField()

    num_false_ripe = models.IntegerField()
    num_false_unripe = models.IntegerField()

    avg_ripeness_pick = models.FloatField(null=True, blank=True)
    avg_ripeness_no_pick = models.FloatField(null=True, blank=True)

    total_targets = models.IntegerField()
    tags = TaggableManager(through='EmustatsTag')


class EmustatsTag(TaggedItemBase):
    content_object = models.ForeignKey(EmustatsReport, on_delete=models.CASCADE)