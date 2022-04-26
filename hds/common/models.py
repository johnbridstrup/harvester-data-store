from django.db import models
from django.contrib.auth.models import User


class CommonInfo(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(app_label)s_%(class)s_creator_related")
    modifiedBy = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(app_label)s_%(class)s_modifiedby_related",
                                   blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    lastModified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.lastModified)

    class Meta:
        abstract = True


class ReportBase(CommonInfo):
    """ ReportBase Model """
    reportTime = models.DateTimeField(blank=True, null=True)
    report = models.JSONField(blank=True, null=True)

    class Meta:
        abstract = True
