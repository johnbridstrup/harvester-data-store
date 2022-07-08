import logging
from harvester.models import Harvester, Location


class ReportExtractor:
    def __init__(self, data, action=None):
        self.data = data

    def tablify(self, **kwargs):
        raise NotImplementedError


class ErrorReportExtractor(ReportExtractor):
    LIST = 'list'
    RETRIEVE = 'retrieve'

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
        rep = report['data']

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

    def _perform_extraction(self, report):
        outdata = self._extract_error_traceback(report['report'])
        outdata.update(self._get_additional_data(report))
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
