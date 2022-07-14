import logging
from collections import defaultdict
from datetime import datetime
from harvester.models import Harvester, Location
import pytz


class ReportExtractor:
    def __init__(self, data, action=None):
        self.data = data

    def tablify(self, **kwargs):
        raise NotImplementedError


class ErrorReportExtractor(ReportExtractor):
    LIST = 'list'
    RETRIEVE = 'retrieve'
    MASTER_INDEX = 0

    def __init__(self, data, action):
        super().__init__(data)
        self.action = action

    def _serv_in_error(self, errdict):
        data = {}
        try:
            data["service"] = list(errdict.keys())[0]
        except IndexError:
            data["service"] = "unknown"
        data["error"] = errdict.get(data["service"], {})
        data["error"].pop("ts", None)
        return data

    def _extract_error_traceback(self, report):
        rep = report['report']['data']

        data = {}
        data["branch"] = rep.pop("branch_name", None)
        data["githash"] = rep.pop("githash", None)
        data["report"] = rep.get('sysmon_report', {})
        data["report"].pop("serial_number", None)

        rep.pop("serial_number")
        for key, sysdict in rep['sysmon_report'].items():
            if 'sysmon' in key:
                if "errors" in sysdict:
                    err = rep['sysmon_report'][key].pop("errors", {})
                    data.update(self._serv_in_error(err))
                    data["code"] = data["error"].pop("code", 0)
                    return data
        logging.debug("No error info in sysmon report")
        logging.debug(report)
        return data

    def _get_additional_data(self, report):
        return {
            "harvester": Harvester.objects.get(pk=report['harvester']),
            "location": Location.objects.get(pk=report["location"]),
            "time": report['reportTime'],
            "report_number": report['id'] 
        }

    def _sysmon_to_robot(self, data):
        sysmon_report = data['report']
        d = defaultdict(dict)
        for key, sysm in sysmon_report.items():
            s_index = int(key.split('.')[1])
            r_index = int(sysm.get('robot_index', s_index))
            if s_index == self.MASTER_INDEX:
                d['Master'] = sysm
            elif r_index == s_index:
                d[f"Robot {r_index}"].update({'NUC': sysm})
            else:
                d[f"Robot {r_index}"].update({'JETSON': sysm})
        return dict(d)

    def _perform_extraction(self, report):
        outdata = self._extract_error_traceback(report)
        outdata.update(self._get_additional_data(report))
        outdata['report'] = self._sysmon_to_robot(outdata)
        return outdata


    def tablify(self, **kwargs):
        if self.action == self.RETRIEVE:
            outdata = self._perform_extraction(self.data)
            return outdata

        elif self.action == self.LIST:
            results = []
            outdata = self.data
            for rep in self.data['results']:
                results.append(self._perform_extraction(rep))
            outdata['results'] = results
        return outdata


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
        dt = tz.localize(datetime.strptime(dt_str, '%Y%m%d%H%M%S'))

        return dt

    @classmethod
    def format_datetime(cls, dt_str, tz_str):
        t = cls.fill_dt_with_zeros(dt_str)
        return cls.convert_to_datetime(t, tz_str)


