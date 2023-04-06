import re, os
import structlog
from rest_framework import serializers
from logparser.models import LogFile, LogSession
from common.async_metrics import ASYNC_ERROR_COUNTER
from common.reports import DTimeFormatter
from logparser.models import TIMEZONE
from .logsessionserializers import LogSessionBaseSerializer

logger = structlog.get_logger(__name__)

LOG_DATE_PATTERN = re.compile(r'\[\d{8}T\d{6}.[0-9]+\]')


class DateMatchError(Exception):
    pass


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
        matches = LOG_DATE_PATTERN.search(line_str)
        date_obj = None
        if matches:
            date_obj = DTimeFormatter.convert_to_datetime(
              matches.group(0)[1:-1],
              TIMEZONE,
              format='%Y%m%dT%H%M%S.%f'
            )
        else:
            ASYNC_ERROR_COUNTER.labels(
                'convert_to_datetime',
                AttributeError.__name__,
                "Failed date pattern match"
            ).inc()
            logger.error(f"could not match the date on line {line_str}")
        return date_obj

    @staticmethod
    def extract_service_robot(filename):
        """
        extract service and robot from file name

        e.g 20220208105000_005_00_autodrive.log

        returns tuple[autodrive | None, 0 | None]
        """
        service = None
        robot = None

        robot_pattern = re.compile(r'_\d{2}_')
        service_pattern = re.compile(r'[a-z]+(_[a-z]+)?')
        robot_match = robot_pattern.search(filename)
        service_match = service_pattern.search(filename)

        if robot_match is not None:
            robot = int(robot_match.group(0).replace("_", ""))
        else:
            ASYNC_ERROR_COUNTER.labels(
                'extract_service_robot',
                AttributeError.__name__,
                "Failed robot pattern match"
            ).inc()
            logger.error(
                f"could not match robot id on file {filename}"
            )
        if service_match is not None:
            service = service_match.group(0)
        else:
            ASYNC_ERROR_COUNTER.labels(
                'extract_service_robot',
                AttributeError.__name__,
                "Failed service pattern match"
            ).inc()
            logger.error(f"could not match service on file {filename}")
        return service, robot

    @classmethod
    def _report_date_match_fail(cls, entry):
        ASYNC_ERROR_COUNTER.labels(
            'extract_log_file',
            DateMatchError.__name__,
            "Failed date pattern match"
        ).inc()
        logger.error(f'No match for the line {entry}')

    @classmethod
    def _extract_lines(cls, file_iter, service, robot, ext):
        def create_content_dict(msg):
            date_obj = cls.convert_to_datetime(entry)
            if date_obj is None:
                raise DateMatchError("Failed to match date")
            return {
                'service': service,
                'robot': robot,
                'timestamp': date_obj.timestamp(),
                'logfile_type': ext,
                'log_date': str(date_obj),
                'log_message': msg,
            }

        content = []
        first = True
        entry = ""
        for line in file_iter:
            try:
                line = line.decode("ascii")
            except AttributeError:
                pass

            if LOG_DATE_PATTERN.match(line):
                if first:
                    first = False
                    entry = line
                    continue

                entry = entry.rstrip().strip("\n")
                if len(entry) == 0:
                    continue

                try:
                    content_dict = create_content_dict(entry)
                except DateMatchError:
                    cls._report_date_match_fail(entry)
                    continue
                content.append(content_dict)
                entry = line
            else:
                entry = entry + line

        # append the last line
        entry = entry.rstrip().strip("\n")
        if len(entry) != 0:
            try:
                content.append(create_content_dict(entry))
            except DateMatchError:
                cls._report_date_match_fail(entry)
        return content

    @classmethod
    def extract_log_file(cls, thezip, zip_obj_id, file):
        """
        extract file content and save to model by

        matching service, robot, date, log_message and create them as dict

        appends the dict to content_list and saves the model.

        """
        service, robot = cls.extract_service_robot(file.filename)

        log_session = LogSession.objects.get(pk=zip_obj_id)
        log_file = LogFile(
          file_name=file.filename,
          log_session=log_session,
          creator=log_session.creator,
          service=service,
          robot=robot
        )
        content = []
        _, ext = os.path.splitext(file.filename)

        with thezip.open(file, "r") as file_iter:
            content = cls._extract_lines(file_iter, service, robot, ext)

        log_file.content = content
        log_file.save()
