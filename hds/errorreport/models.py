from django.db import models
from common.reports import ReportBase
from event.models import PickSessionModelMixin
from exceptions.utils import sort_exceptions
from notifications.slack import Emojis

DEFAULT_UNKNOWN = "unknown"


class ErrorReport(PickSessionModelMixin, ReportBase):
    """ ErrorReport Model """
    githash = models.CharField(max_length=20, default=DEFAULT_UNKNOWN)
    gitbranch = models.CharField(max_length=50, default=DEFAULT_UNKNOWN)

    def _slack_msg(self, action_msg, emoji, exc_strs):
        return (
            f"{emoji} *Error on Harvester {self.harvester.harv_id}* {emoji}\n"
            f"ts: {self.reportTime}\n"
            f"Action: {action_msg}\n"
            f"Exceptions: {''.join(exc_strs)}\n"
            f"Location: {self.location.ranch}\n"
        )

    def __str__(self):
        excs = sort_exceptions(self.exceptions.all())
        exc_strs = [f"\n\t{str(exc)}" for exc in excs]

        excs_exist = len(excs) > 0

        if not excs_exist:
            action_msg = "*Unknown: No exceptions received.*"
            handle_emoji = Emojis.UNKNOWN.value
            return self._slack_msg(action_msg, handle_emoji, [])

        cyclable = all([exc.code.cycle for exc in excs])
        handled = all([exc.handled for exc in excs])
        if cyclable and handled:
            action_msg = "*Attempting to cycle the robot.*"
            handle_emoji = Emojis.HANDLE_CYCLE.value
        elif handled:
            action_msg = "*Disarming the robot.*"
            handle_emoji = Emojis.HANDLE_DISARM.value
        else:
            action_msg = "*Unable to handle.*"
            handle_emoji = Emojis.UNHANDLED.value
        
        return self._slack_msg(action_msg, handle_emoji, exc_strs)
