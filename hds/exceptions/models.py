from django.db import models
from common.models import CommonInfo
from errorreport.models import ErrorReport


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


class AFTException(CommonInfo):
    code = models.ForeignKey(AFTExceptionCode, on_delete=models.SET_NULL, null=True)
    service = models.TextField(max_length=20, blank=True, null=True)
    node = models.IntegerField(blank=True, null=True)
    traceback = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(blank=True, null=True)
    report = models.ForeignKey(ErrorReport, on_delete=models.SET_NULL, null=True, related_name="exceptions")

    def __str__(self):
        return f"{self.service}.{self.node}: {self.code.name}"
