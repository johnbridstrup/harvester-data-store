from rest_framework import serializers
import datetime


class ReportSerializerBase(serializers.ModelSerializer):
    def extract_timestamp(self, timestamp):
        """get POSIX timestamp and return in date format"""
        return datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S.%f')
