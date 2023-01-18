from datetime import datetime
import pytz


DEFAULT_TZ = "US/Pacific"

class DTimeFormatter:
    @classmethod
    def fill_dt_with_zeros(cls, dt_str):
        """Fill with zeros if not all YYYYMMDDHHmmss are present"""
        if len(dt_str) < 14:
            dt_str += '0' * (14 - len(dt_str))
        return dt_str

    @classmethod
    def convert_to_datetime(cls, dt_str, tz_str, format='%Y%m%dT%H%M%S.%f'):
        tz = pytz.timezone(tz_str)
        dt = tz.localize(datetime.strptime(dt_str, format))

        return dt

    @classmethod
    def format_datetime(cls, dt_str, tz_str):
        t = cls.fill_dt_with_zeros(dt_str)
        return cls.convert_to_datetime(t, tz_str)

    @classmethod
    def localize_to_tz(cls, timestamp, inc=False, dec=False):
        if inc:
            timestamp = timestamp + 1
        if dec:
            timestamp = timestamp - 1
        date_obj = datetime.fromtimestamp(
            timestamp,
            tz=pytz.utc
        )
        date_str = date_obj.astimezone(tz=pytz.timezone(
            DEFAULT_TZ
        )).strftime('%Y%m%dT%H%M%S.%f')
        return date_str
