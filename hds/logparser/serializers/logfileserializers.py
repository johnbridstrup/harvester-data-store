import re, os
import structlog
from rest_framework import serializers
from logparser.models import LogFile, LogSession
from common.async_metrics import ASYNC_ERROR_COUNTER
from common.reports import DTimeFormatter
from logparser.models import TIMEZONE
from .logsessionserializers import LogSessionBaseSerializer

logger = structlog.get_logger(__name__)

LOG_PATTERN = r'\[(.*?)\]\s*\[(.*?)\]\s*\[(.*?)\]\s*--\s*(.*)'
CAN_PATTERN = r'\[(.*?)\]'
ESC_SEQ_PATTERN = r'\x1B\[[0-9;]*[m|K]'


class DateMatchError(Exception):
    pass


class LogDoesNotMatch(Exception):
    pass


class FilenameMatchError(Exception):
    pass


class LogFileSerializer(serializers.ModelSerializer):
    """Serializer for log file model."""
    log_session = LogSessionBaseSerializer()

    class Meta:
        model = LogFile
        fields = ('__all__')
        read_only_fields = ['id']

    @staticmethod
    def convert_to_datetime(date_str:str):
        """
        extract date str from line e.g

        [20220208T105000.012]

        return datetime object or None.

        """
        date_obj = None
        try:
            date_obj = DTimeFormatter.convert_to_datetime(
              date_str,
              TIMEZONE,
              format='%Y%m%dT%H%M%S.%f'
            )
        except Exception as e:
            ASYNC_ERROR_COUNTER.labels(
                'convert_to_datetime',
                e.__class__.__name__,
                "Failed date pattern match"
            ).inc()
            logger.error(f"could not match the date string {date_str}")
        return date_obj

    @staticmethod
    def extract_filename(filename):
        """
        extract service and robot from file name

        e.g 20220208105000_005_00_autodrive.log

        returns tuple[autodrive | None, 0 | None]
        """
        service = None
        robot = None
        harv = None

        pattern = r'^(.*?)_(.*?)_(.*?)_(.*?)\.(.*)$'  #(ts)_(harvid)_(robotid)_(serv)(.ext)

        matches = re.match(pattern, filename)
        if not matches:
            ASYNC_ERROR_COUNTER.labels(
                'extract_filename',
                FilenameMatchError.__name__,
                "Failed to match filename"
            ).inc()
            raise FilenameMatchError(f"Failed to match filename: {filename}")
        
        harv = matches.group(2)
        robot = matches.group(3)
        service = matches.group(4)
        ext = matches.group(5)
        

        return service, robot, harv, f".{ext}"

    @classmethod
    def _report_date_match_fail(cls, entry):
        ASYNC_ERROR_COUNTER.labels(
            'extract_log_file',
            DateMatchError.__name__,
            "Failed date pattern match"
        ).inc()
        logger.error(f'No date match for the line {entry}')
    
    @classmethod
    def _report_line_match_fail(cls, entry):
        logger.error(f'No line match for the line {entry}')
        ASYNC_ERROR_COUNTER.labels(
            'extract_log_file',
            LogDoesNotMatch.__name__,
            "Failed line pattern match"
        ).inc()

    @classmethod
    def _extract_can(cls, line):
        match = re.match(CAN_PATTERN, line)

        if not match:
            # We do not expect this in can dumps
            cls._report_line_match_fail(line)
            raise LogDoesNotMatch("Failed to match can line")

        date = match.group(1)
        dt = cls.convert_to_datetime(date)
        if dt is None:
            raise DateMatchError

        content_dict = {
            'timestamp': dt.timestamp(),
            'log_date': str(dt),
            'log_message': line,
        }
        return content_dict

    @classmethod
    def _extract_log(cls, line):
        matches = re.match(LOG_PATTERN, line)

        if not matches:
            # We expect this for multi-line logs
            raise LogDoesNotMatch("failed to match log line")

        date = matches.group(1)
        level = matches.group(2)
        serv_logger = matches.group(3)
        dt = cls.convert_to_datetime(date)
        if dt is None:
            raise DateMatchError

        content_dict = {
            'timestamp': dt.timestamp(),
            'log_date': str(dt),
            'log_level': level,
            'logger': serv_logger
        }
        return content_dict

    @classmethod
    def _extract_line(cls, line, ext):
        if ext == '.log':
            return cls._extract_log(line)
        elif ext == '.dump':
            return cls._extract_can(line)

    @classmethod
    def _extract_lines(cls, file_iter, service, robot, harv, ext):
        def clean_line(line):
            cleaned_line = re.sub(ESC_SEQ_PATTERN, '', line)
            cleaned_line = cleaned_line.rstrip().strip('\n')
            return cleaned_line

        content = []
        prev_content = None
        content_dict = None
        for line in file_iter:
            try:
                line = line.decode("ascii")
            except AttributeError:
                pass
            
            line = clean_line(line)
            try:
                content_dict = cls._extract_line(line, ext)
                if prev_content:
                    content_dict['logfile_type'] = ext
                    content_dict['service'] = service
                    content_dict['robot'] = int(robot)
                    content_dict['harv_id'] = int(harv)
                    content_dict['log_message'] = full_line
                    content.append(content_dict)
                prev_content = content_dict
                full_line = line
            except DateMatchError:
                cls._report_date_match_fail(line)
                full_line += f"\n{line}"
                continue
            except LogDoesNotMatch:
                full_line += f"\n{line}"
                continue
        
        if content_dict is not None:
            content_dict['logfile_type'] = ext
            content_dict['service'] = service
            content_dict['robot'] = int(robot)
            content_dict['harv_id'] = int(harv)
            content_dict['log_message'] = full_line
            content.append(content_dict)
        
        return content

    @classmethod
    def extract_log_file(cls, thezip, zip_obj_id, file):
        """
        extract file content and save to model by

        matching service, robot, date, log_message and create them as dict

        appends the dict to content_list and saves the model.

        """
        service, robot, harv, ext = cls.extract_filename(file.filename)

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
            content = cls._extract_lines(file_iter, service, robot, harv, ext)

        log_file.content = content
        log_file.save()
