from common.filters import CommonInfoFilterset

from .models import MigrationLog


class MigrationLogFilterset(CommonInfoFilterset):
    class Meta:
        model = MigrationLog
        fields = CommonInfoFilterset.FIELDS_BASE + [
            "result",
        ]
