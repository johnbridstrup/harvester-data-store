from datetime import datetime
import pytz


class DTimeFormatter:
    @classmethod
    def fill_dt_with_zeros(cls, dt_str):
        """Fill with zeros if not all YYYYMMDDHHmmss are present"""
        if len(dt_str) < 14:
            dt_str += '0' * (14 - len(dt_str))
        return dt_str

    @classmethod
    def convert_to_datetime(cls, dt_str, tz_str):
        tz = pytz.timezone(tz_str)
        dt = tz.localize(datetime.strptime(dt_str, '%Y%m%dT%H%M%S.%f'))

        return dt

    @classmethod
    def format_datetime(cls, dt_str, tz_str):
        t = cls.fill_dt_with_zeros(dt_str)
        return cls.convert_to_datetime(t, tz_str)


