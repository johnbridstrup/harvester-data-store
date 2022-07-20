from django.db import models
from common.models import CommonInfo


class AFTExceptionCode(CommonInfo):
    """AFT exception code schema model.

    Attributes:
        code (Int): The exception code value.
        name (str): The name of the exception in code (eg. GophrDeviceException)
        msg (str): A message associated with the exception.
        description (str): A brief description of the exception.
        
    """
    code = models.IntegerField(unique=True)
    name = models.TextField(unique=True, max_length=255)
    msg = models.TextField(max_length=255, blank=True)
    team = models.TextField(max_length=20)
    cycle = models.BooleanField()

    def __str__(self):
        return f"Code {self.code}: {self.name}"
