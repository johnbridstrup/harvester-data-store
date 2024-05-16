from common.filters import CommonInfoFilterset, TagListFilter

from .models import LogFile, LogSession, LogVideo


class LogFileFilterset(CommonInfoFilterset):
    class Meta:
        model = LogFile
        fields = CommonInfoFilterset.FIELDS_BASE + [
            "log_session_id",
        ]


class LogSessionFilterset(CommonInfoFilterset):
    tags = TagListFilter()

    class Meta:
        model = LogSession
        fields = CommonInfoFilterset.FIELDS_BASE + [
            "harv__harv_id",
        ]


class LogVideoFilterset(CommonInfoFilterset):
    class Meta:
        model = LogVideo
        fields = CommonInfoFilterset.FIELDS_BASE + [
            "log_session_id",
            "category",
            "robot",
            "log_session__harv__harv_id",
        ]
