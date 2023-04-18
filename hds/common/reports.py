from datetime import datetime
import pytz

from django.db import models
from django.utils.dateparse import parse_datetime
from taggit.managers import TaggableManager

from harvester.models import Harvester, Location
from .models import CommonInfo


DEFAULT_TZ = "US/Pacific"
LOG_TIMESTAMP_FMT = '%Y%m%dT%H%M%S.%f'
UTILITY_TIMESTAMP_FMT = "%Y%m%d%H%M%S"


class ReportBase(CommonInfo):
    """ ReportBase Model """
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True)
    harvester = models.ForeignKey(Harvester, on_delete=models.CASCADE, null=True, blank=True)
    reportTime = models.DateTimeField(blank=True, null=True)
    report = models.JSONField(blank=True, null=True)
    tags = TaggableManager()

    class Meta:
        abstract = True


class DTimeFormatter:
    @classmethod
    def from_timestamp(cls, ts):
        return datetime.fromtimestamp(ts)

    @classmethod
    def str_from_timestamp(cls, ts):
        fmt = '%Y-%m-%dT%H:%M:%S.%fZ'
        dt = cls.from_timestamp(ts)
        return dt.strftime(fmt)
    
    @classmethod
    def fill_dt_with_zeros(cls, dt_str):
        """Fill with zeros if not all YYYYMMDDHHmmss are present"""
        if len(dt_str) < 14:
            dt_str += '0' * (14 - len(dt_str))
        return dt_str

    @classmethod
    def convert_to_datetime(cls, dt_str, tz_str, format=None):
        # try standard parse datetime first
        tz = pytz.timezone(tz_str)
        try:
            dt = parse_datetime(dt_str)
            if dt:  # parse datetime will return None if it doesn't match
                return tz.localize(dt)
        except ValueError:
            pass
        
        if format:
            return tz.localize(datetime.strptime(dt_str, format))
        
        try:
            return tz.localize(datetime.strptime(dt_str, LOG_TIMESTAMP_FMT))
        except ValueError:
            return tz.localize(datetime.strptime(dt_str, UTILITY_TIMESTAMP_FMT))

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
