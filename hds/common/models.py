from django.db import models
from django.contrib.auth.models import User
from enum import Enum

from hds.roles import RoleChoices


class CommonInfo(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(app_label)s_%(class)s_creator_related")
    modifiedBy = models.ForeignKey(User, on_delete=models.CASCADE, related_name="%(app_label)s_%(class)s_modifiedby_related",
                                   blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True, db_index=True)
    lastModified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.lastModified)

    class Meta:
        abstract = True

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    slack_id = models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=31, choices=RoleChoices.choices, default=RoleChoices.SUPPORT)


class Tags(Enum):
    # WARNING!!!
    # Changing any of these will require a migration.
    # Adding new ones is fine.
    INCOMPLETE = "incomplete"
    INVALID = "invalid"
    INVALIDSCHEMA = "invalid schema"
    MISSINGVALUE = "missing value"
