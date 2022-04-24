from django.db import models
from django.contrib.auth.models import User


class CommonInfo(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='creator')
    modifiedBy = models.ForeignKey(User, on_delete=models.CASCADE, related_name='modifiedBy', blank=True, null=True)
    lastModified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.lastModified)
