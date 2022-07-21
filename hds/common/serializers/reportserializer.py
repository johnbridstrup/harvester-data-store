from rest_framework import serializers
import datetime


class ReportSerializerBase(serializers.ModelSerializer):
    @classmethod
    def extract_timestamp(cls, timestamp):
        """get POSIX timestamp and return in date format"""
        return datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S.%f')
