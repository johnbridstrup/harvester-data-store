import re
import logging
from rest_framework import serializers
from logparser.models import LogFile, LogSession
from common.async_metrics import ASYNC_ERROR_COUNTER
from common.reports import DTimeFormatter
from logparser.models import TIMEZONE
from .logsessionserializers import LogSessionBaseSerializer


class LogFileSerializer(serializers.ModelSerializer):
    """Serializer for log file model."""
    log_session = LogSessionBaseSerializer()

    class Meta:
        model = LogFile
        fields = ('__all__')
        read_only_fields = ['id']

    @staticmethod
    def convert_to_datetime(line_str:str):
        """
        extract date str from line e.g

        [20220208T105000.012]

        return datetime object or None.

        """
        pattern = re.compile(r'\d{8}T\d{6}.\d{3}')
        matches = pattern.search(line_str)
        date_obj = None
        if matches:
            date_obj = DTimeFormatter.convert_to_datetime(
              matches.group(0),
              TIMEZONE,
              format='%Y%m%dT%H%M%S.%f'
            )
        else:
            ASYNC_ERROR_COUNTER.labels(
                'convert_to_datetime',
                AttributeError.__name__,
                "Failed date pattern match"
            ).inc()
            logging.error(f"could not match the date on line {line_str}")
        return date_obj

    @staticmethod
    def extract_service_robot(file):
        """
        extract service and robot from file name

        e.g 20220208105000_005_00_autodrive.log

        returns tuple[autodrive | None, 0 | None]
        """
        service = None
        robot = None

        robot_pattern = re.compile(r'_\d{2}_')
        service_pattern = re.compile(r'[a-z]+(_[a-z]+)?')
        robot_match = robot_pattern.search(file.filename)
        service_match = service_pattern.search(file.filename)

        if robot_match is not None:
            robot = int(robot_match.group(0).replace("_", ""))
        else:
            ASYNC_ERROR_COUNTER.labels(
                'extract_service_robot',
                AttributeError.__name__,
                "Failed robot pattern match"
            ).inc()
            logging.error(
                f"could not match robot id on file {file.filename}"
            )
        if service_match is not None:
            service = service_match.group(0)
        else:
            ASYNC_ERROR_COUNTER.labels(
                'extract_service_robot',
                AttributeError.__name__,
                "Failed service pattern match"
            ).inc()
            logging.error(f"could not match service on file {file.filename}")
        return service, robot

    @classmethod
    def extract_log_file(cls, thezip, zip_obj_id, file):
        """
        extract file content and save to model by

        matching service, robot, date, log_message and create them as dict

        appends the dict to content_list and saves the model.

        """
        service, robot = cls.extract_service_robot(file)
        date_pattern = re.compile(r'\[\d{8}T\d{6}.\d{3}\]')
        log_session = LogSession.objects.get(pk=zip_obj_id)
        log_file = LogFile(
          file_name=file.filename,
          log_session=log_session,
          creator=log_session.creator,
          service=service,
          robot=robot
        )
        content = []

        with thezip.open(file, "r") as file_iter:
            first = True
            entry = ""
            for line in file_iter:
                line = line.decode("ascii")
                if date_pattern.match(line):
                    if first:
                        first = False
                        entry = line
                        continue
                    entry = entry.rstrip().strip("\n")
                    content_dict = {
                    'service': service,
                    'robot': robot,
                    }
                    date_obj = cls.convert_to_datetime(entry)
                    if date_obj is None:
                        ASYNC_ERROR_COUNTER.labels(
                            'extract_log_file',
                            AttributeError.__name__,
                            "Failed date pattern match"
                        ).inc()
                        logging.error(f'No match for the line {entry}')
                        continue
                    content_dict["timestamp"] = date_obj.timestamp()
                    content_dict["log_date"] = str(date_obj)
                    content_dict["log_message"] = entry
                    content.append(content_dict)
                    entry = line
                else:
                    entry = entry + line
        log_file.content = content
        log_file.save()
