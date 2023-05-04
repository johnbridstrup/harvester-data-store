from django.db import models
from common.models import CommonInfo
from errorreport.models import ErrorReport


DEFAULT_OPERATOR_MSG = "Please cycle the harvester"
class AFTExceptionCodeManifest(CommonInfo):
    """Manifest of exception codes.

    This is a JSON containing the information for every AFTExceptionCode.
    It will be generated in the aft-py-packages CD stage and send to HDS.
    The point of this is to allow for a single source of truth regarding
    the exception codes, and allow reverting to a previous set if there
    is a mistake.
    """
    version = models.CharField(max_length=31)
    manifest = models.JSONField()


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
    operator_msg = models.CharField(max_length=255, default=DEFAULT_OPERATOR_MSG)
    manifest = models.ForeignKey(
        AFTExceptionCodeManifest, 
        null=True, 
        on_delete=models.SET_NULL,
    )

    def __str__(self):
        return f"Code {self.code}: {self.name}"


class AFTException(CommonInfo):
    code = models.ForeignKey(AFTExceptionCode, on_delete=models.SET_NULL, null=True)
    service = models.TextField(max_length=20, blank=True, null=True)
    node = models.IntegerField(blank=True, null=True)
    robot = models.IntegerField(null=True, blank=True)
    traceback = models.TextField(blank=True, null=True)
    info = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(blank=True, null=True)
    report = models.ForeignKey(ErrorReport, on_delete=models.CASCADE, null=True, related_name="exceptions")
    handled = models.BooleanField(default=False)
    primary = models.BooleanField(null=True, blank=True)

    def __str__(self):
        handled_str = "unhandled"
        primary_str = "unknown"
        if self.handled:
            handled_str = "handled"
        if self.primary is not None:
            primary_str = "Primary" if self.primary else "Secondary"
        
        return f"{self.service}.{self.robot} {handled_str} error: {self.code.name} ({primary_str})"
