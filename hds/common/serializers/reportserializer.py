from rest_framework import serializers
from harvester.models import Harvester
import datetime


class ReportSerializerBase(serializers.ModelSerializer):
    @classmethod
    def extract_timestamp(cls, timestamp):
        """get POSIX timestamp and return in date format"""
        return datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S.%f')

    def get_harvester(self, harv_id, report, fruit_key="fruit"):
        # must pass in level of report with is_emulator and fruit keys
        is_emulator = report.get("is_emulator", False)
        if is_emulator:
            fruit = report.get(fruit_key)
            # This is something of a hack. Our emulator runners have overlapping 
            # harv ids, so we should grab a single "fruit" emulator for now.
            harv = Harvester.objects.get(is_emulator=True, fruit__name=fruit)
        else:
            harv = Harvester.objects.get(harv_id=harv_id)
        
        return harv
