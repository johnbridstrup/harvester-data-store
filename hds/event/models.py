from django.db import models
from common.models import CommonInfo

import uuid


class Event(CommonInfo):
    """Abstraction of "events" so that multiple different
    reports or other objects can be linked.
    """
    UUID = models.CharField(max_length=40, unique=True)

    def __str__(self):
        return f"Event UUID {self.UUID}"

    @classmethod
    def generate_uuid(cls):
        return str(uuid.uuid1())

    
class EventModelMixin(models.Model):
    """Mixin class for models that are associated with events.
    """
    event = models.ForeignKey(Event, on_delete=models.CASCADE)

    class Meta:
        abstract = True
