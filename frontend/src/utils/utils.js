import { Oval } from "react-loader-spinner";

export const Loader = ({ size }) => {
  return <Oval color="#00BFFF" height={size} width={size} />;
};

export const transformHarvOptions = (harvesters = []) => {
  return harvesters.map((harvester, index) => {
    return { value: harvester.harv_id, label: harvester.harv_id };
  });
};

export const transformLocOptions = (locations = []) => {
  return locations.map((loc, index) => {
    return { value: loc.ranch, label: loc.ranch };
  });
};

const extractServiceCodes = (exceptions = []) => {
  let services = [];
  let codes = [];
  exceptions.forEach((exec) => {
    services.push(`${exec.service}.${exec.node}`);
    codes.push(exec.code.code);
  });
  return { services, codes };
};

export const transformErrorReport = (reports = []) => {
  return reports.map((report, index) => {
    const reportObj = {
      reportId: report.id,
      created: report.created,
      lastModified: report.lastModified,
      reportTime: report.reportTime,
      creator: report.creator,
      modifiedBy: report.modifiedBy,
      location: report.location,
      harvester: report.harvester,
      timestamp: report.report.timestamp,
      serial_number: report.report.data.serial_number,
      githash: report.report.data.githash,
      branch_name: report.report.data.branch_name,
      exceptions: report.exceptions,
    };
    const resultObj = Object.assign({}, reportObj, ...report.exceptions);
    const { services, codes } = extractServiceCodes(report.exceptions);
    resultObj["service"] = services.join(", ");
    resultObj["code"] = codes.join(", ");
    return resultObj;
  });
};

export const transformTableErrorReport = (
  errorreport = [],
  harvesters = [],
  locations = []
) => {
  return errorreport.map((report, index) => {
    const harvester = harvesters.find((x) => x.id === report.harvester) || {};
    const location = locations.find((x) => x.id === report.location) || {};

    return { ...report, harvester, location };
  });
};

export const translateHarvOptions = (harv_ids = []) => {
  return harv_ids.map((harv_id, index) => {
    return harv_id.value;
  });
};

export const translateLocOptions = (loc_names = []) => {
  return loc_names.map((loc, index) => {
    return loc.value;
  });
};

// Datetime formatting
function padZeros(str_to_pad, digits) {
  return str_to_pad.toString().padStart(digits, "0");
}

export function timeStampFormat(dateString, timezone = "US/Pacific") {
  let date;
  if (typeof timezone === "string") {
    date = new Date(
      new Date(dateString).toLocaleString("en-US", { timeZone: timezone })
    );
  } else {
    date = new Date(dateString);
  }
  let y = date.getFullYear().toString();
  let M = padZeros(date.getMonth() + 1, 2);
  let d = padZeros(date.getDate(), 2);
  let h = padZeros(date.getHours(), 2);
  let m = padZeros(date.getMinutes(), 2);
  let s = padZeros(date.getSeconds(), 2);
  return y + M + d + h + m + s;
}

const getDateValues = (dateString) => {
  let year = Number(dateString.slice(0, 3 + 1));
  let month = Number(dateString.slice(4, 5 + 1)) - 1;
  let day = Number(dateString.slice(6, 7 + 1));
  let hours = Number(dateString.slice(8, 9 + 1));
  let minutes = Number(dateString.slice(10, 11 + 1));
  let second = Number(dateString.slice(12, dateString.length));
  return { year, month, day, hours, minutes, second };
};

export const extractDateFromString = (dateString) => {
  if (typeof dateString === "string" && dateString.length === 14) {
    let { year, month, day, hours, minutes, second } =
      getDateValues(dateString);
    return new Date(year, month, day, hours, minutes, second);
  } else if (typeof dateString === "string") {
    let paddedDateString = dateString.padEnd(14, "0");
    let { year, month, day, hours, minutes, second } =
      getDateValues(paddedDateString);
    return new Date(year, month, day, hours, minutes, second);
  } else {
    return new Date();
  }
};

export const transformTzOptions = (timezones = []) => {
  return timezones.map((zone, index) => {
    return { value: zone, label: zone };
  });
};

export const paramsToObject = (params) => {
  const urlparams = new URLSearchParams(params);
  const result = {};
  for (const [key, value] of urlparams.entries()) {
    result[key] = value;
  }
  return result;
};

export const copiedUrl = (paramsObj) => {
  const port = process.env.REACT_APP_FRONTEND_PORT || 3000;
  const public_url =
    process.env.REACT_APP_HOSTED_URL || `http://localhost:${port}`;
  const searchParams = new URLSearchParams(paramsObj);
  return `${public_url}/errorreports/?${searchParams.toString()}`;
};

export const transformReportDetail = (report = {}) => {
  const reportObj = { ...report };
  const { services, codes } = extractServiceCodes(reportObj.exceptions);
  reportObj["service"] = services.join(", ");
  reportObj["code"] = codes.join(", ");
  return reportObj;
};

export const transformExceptionObj = (exceptions = []) => {
  let exceptObj = {};
  exceptions.forEach((obj) => {
    exceptObj[`${obj.service}.${obj.node}: ${obj.code.code}`] = obj;
  });
  return exceptObj;
};

export const transformSysmonReport = (sysmonReport = {}) => {
  const sysReport = {};
  let masterIndex = 0;
  for (const [key, value] of Object.entries(sysmonReport)) {
    let sysIndex = key.split(".")[1];
    let robotIndex;
    if (sysIndex) {
      sysIndex = Number(sysIndex);
      robotIndex = Number(value["robot_index"] || sysIndex);
    } else {
      continue;
    }
    if (sysIndex === masterIndex) {
      sysReport["Master"] = value;
    } else if (robotIndex === sysIndex) {
      let robot = `Robot ${robotIndex}`;
      if (!sysReport[robot]) {
        sysReport[robot] = {};
      }
      if (!("NUC" in sysReport[robot])) {
        sysReport[robot] = { ...sysReport[robot], NUC: {} };
      }
      sysReport[robot]["NUC"] = value;
    } else {
      let robot = `Robot ${robotIndex}`;
      if (!sysReport[robot]) {
        sysReport[robot] = {};
      }
      if (!("JETSON" in sysReport[robot])) {
        sysReport[robot] = { ...sysReport[robot], JETSON: {} };
      }
      sysReport[robot]["JETSON"] = value;
    }
  }
  return sysReport;
};

export const transformSysmonServices = (sysmon = {}) => {
  const sysmonArr = [];
  for (const [key, value] of Object.entries(sysmon)) {
    let service = [];
    service.push(key);
    service.push(value["cpu"]);
    service.push(value["mem"]);
    if (value?.fsm?.components)
      service.push(value["fsm"]["components"].join(", "));
    sysmonArr.push(service);
  }
  return sysmonArr;
};

export const debounce = function (cb, timeout) {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      cb(...args);
    }, timeout);
  };
};

export const transformFruitOptions = (fruits = []) => {
  return fruits.map((fruit, index) => {
    return { value: fruit.name, label: fruit.name };
  });
};

export const transformCodeOptions = (codes = []) => {
  return codes.map((code, index) => {
    return { value: code.code, label: code.code };
  });
};

export const translateCodeOptions = (codes = []) => {
  return codes.map((code, index) => {
    return code.value;
  });
};

export const getUniqueListBy = (arr, key) => {
  return [...new Map(arr.map((item) => [item[key]["code"], item])).values()];
};
