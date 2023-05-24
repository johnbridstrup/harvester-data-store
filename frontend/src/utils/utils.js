import {
  API_URL,
  LOG_STR_PATTERN,
  MASTER_ROBOT,
  PROD_ENV,
  PushStateEnum,
  THEME_MODES,
} from "features/base/constants";
import { Oval } from "react-loader-spinner";

export const Loader = ({ size }) => {
  return <Oval color="#00BFFF" height={size} width={size} />;
};

export const transformHarvOptions = (harvesters = []) => {
  return harvesters.map((harvester, index) => {
    return { value: harvester.harv_id, label: harvester.harv_id };
  });
};

export const transformLocOptions = (locations = [], includeID = false) => {
  if (includeID) {
    return locations.map((loc, index) => {
      return { value: loc.id, label: loc.ranch };
    });
  }
  return locations.map((loc, index) => {
    return { value: loc.ranch, label: loc.ranch };
  });
};

/**
 * Extract service and codes from exception array
 * @param {Array} exceptions
 * @returns
 */
export const extractServiceCodes = (exceptions = []) => {
  let services = [];
  let codes = [];
  /**
   * If exception is primary (*) is added to service & code
   * @param {Boolean} primary
   * @returns {string}
   */
  function checkPrimary(primary) {
    return primary ? "*" : "";
  }
  exceptions.forEach((exec) => {
    services.push(`${exec.service}.${exec.robot}${checkPrimary(exec.primary)}`);
    codes.push(`${exec.code.code}${checkPrimary(exec.primary)}`);
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
      timestamp: report.report?.timestamp,
      serial_number: report.harvester.harv_id,
      githash: report.githash,
      branch_name: report.gitbranch,
      exceptions: report.exceptions,
    };
    const resultObj = Object.assign({}, reportObj, ...report.exceptions);
    const { services, codes } = extractServiceCodes(report.exceptions);
    resultObj["service"] = services.join(", ");
    resultObj["code"] = codes.join(", ");
    return resultObj;
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

export const translateFruitOptions = (fruits = []) => {
  return fruits.map((fruit, index) => {
    return fruit.value;
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
  let m = padZeros(date.getMonth() + 1, 2);
  let d = padZeros(date.getDate(), 2);
  let H = padZeros(date.getHours(), 2);
  let M = padZeros(date.getMinutes(), 2);
  let S = padZeros(date.getSeconds(), 2);
  let mm = date.getMilliseconds().toString();
  return `${y}${m}${d}T${H}${M}${S}.${mm}`;
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
  if (
    typeof dateString === "string" &&
    dateString.includes("T") &&
    dateString.includes(".")
  ) {
    let splittedArr = dateString.split(".");
    let dateStr = splittedArr[0].replace("T", "");
    let ms = splittedArr[1];
    if (dateStr.length === 14) {
      let { year, month, day, hours, minutes, second } = getDateValues(dateStr);
      return new Date(year, month, day, hours, minutes, second, Number(ms));
    } else {
      let paddedDateString = dateStr.padEnd(14, "0");
      let { year, month, day, hours, minutes, second } =
        getDateValues(paddedDateString);
      return new Date(year, month, day, hours, minutes, second, Number(ms));
    }
  } else if (typeof dateString === "string" && dateString.includes("T")) {
    let dateStr = dateString.replace("T", "");
    if (dateStr.length === 14) {
      let { year, month, day, hours, minutes, second } = getDateValues(dateStr);
      return new Date(year, month, day, hours, minutes, second);
    } else {
      let paddedDateString = dateStr.padEnd(14, "0");
      let { year, month, day, hours, minutes, second } =
        getDateValues(paddedDateString);
      return new Date(year, month, day, hours, minutes, second);
    }
  } else if (typeof dateString === "string" && dateString.length === 14) {
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

/**
 * return the api url with optional query string
 * @param {object} paramsObj
 * @returns {String}
 */
export const copiedUrl = (paramsObj) => {
  const searchParams = new URLSearchParams(paramsObj);
  return `${API_URL}/errorreports/?${searchParams.toString()}`;
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
    exceptObj[`${obj.service}.${obj.robot}: ${obj.code.code}`] = obj;
  });
  return exceptObj;
};

/**
 * Transform exception array into required array of objects
 * @param {Array} exceptions
 * @returns {Array} exceptions
 */
export const transformExceptions = (exceptions = []) => {
  let exceptArr = [];
  exceptions.forEach((obj) => {
    exceptArr.push({
      exec_label: `${obj.service}.${obj.robot}: ${obj.code.code}`,
      ...obj,
    });
  });
  return exceptArr;
};

/**
 * Transform sysmon report object
 * @param {object} sysmonReport
 * @returns
 */
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

/**
 * Transform sysmon services
 * @param {object} sysmon
 * @returns
 */
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

export const transformFruitOptions = (fruits = [], includeID = false) => {
  if (includeID) {
    return fruits.map((fruit, index) => {
      return { value: fruit.id, label: fruit.name };
    });
  }
  return fruits.map((fruit, index) => {
    return { value: fruit.name, label: fruit.name };
  });
};

export const transformCodeOptions = (codes = []) => {
  return codes.map((code, index) => {
    return { value: code.code, label: `${code.code}: ${code.name}` };
  });
};

export const translateCodeOptions = (codes = []) => {
  return codes.map((code, index) => {
    return code.value;
  });
};

export const transformUserOptions = (users = []) => {
  return users.map((user, index) => {
    return { value: user.id, label: user.username };
  });
};

export const translateUserOptions = (users = []) => {
  return users.map((user, index) => {
    return user.value;
  });
};

export const transformDistOptions = (distributors = []) => {
  return distributors.map((distributor, index) => {
    return { value: distributor.id, label: distributor.name };
  });
};

export const getUniqueListBy = (arr, key) => {
  return [...new Map(arr.map((item) => [item[key]["code"], item])).values()];
};

export const objNotEmpty = (obj) => {
  return Object.keys(obj).length > 0;
};

/**
 * Get services in error state
 * @param {Array} exceptions
 * @param {object} sysmonReport
 * @returns
 */
export const getServicesInError = (exceptions = [], sysmonReport = {}) => {
  let errors = [];
  for (let i = 0; i < exceptions.length; i++) {
    let robotNumber = exceptions[i].robot;
    let service = `${exceptions[i].service}.${exceptions[i].robot}`;
    let robotIndex = `Robot ${robotNumber}`;
    if (Number(robotNumber) === MASTER_ROBOT) {
      if (sysmonReport["Master"]) {
        errors.push({ service, robot: robotNumber });
      }
    } else {
      if (sysmonReport[robotIndex]) {
        errors.push({ service, robot: robotNumber });
      }
    }
  }
  return errors;
};

export const getExceptionKeys = (exceptions = []) => {
  return Object.keys(transformExceptionObj(exceptions));
};

/**
 * Get the robot in error
 * @param {object} exception
 * @param {object} sysmonReport
 * @returns
 */
export const robotInError = (exception, sysmonReport) => {
  let robot = {};
  let robotNumber = exception.robot;
  robot["error"] = true;
  if (Number(robotNumber) === MASTER_ROBOT) {
    robot["robot"] = "Master";
    robot["arm"] = null;
  } else {
    let robotIndex = `Robot ${robotNumber}`;
    let service = `${exception.service}.${exception.robot}`;
    robot["robot"] = robotIndex;
    if (sysmonReport[robotIndex]["NUC"]?.["services"]?.[service]) {
      robot["arm"] = "NUC";
    } else if (sysmonReport[robotIndex]["JETSON"]?.["services"]?.[service]) {
      robot["arm"] = "JETSON";
    }
  }
  return robot;
};

/**
 * Transform sysmon keys
 * @param {Array} sysmonkeys
 * @param {Array} services
 * @param {object} sysmon
 * @returns
 */
export const transformSysmonKeys = (
  sysmonkeys = [],
  services = [],
  sysmon = {}
) => {
  let errored = [];
  services.forEach((service) => {
    let robot = robotInError(service, sysmon);
    errored.push(robot);
  });

  let erroredObj = {};
  errored.forEach((service) => {
    erroredObj[service.robot] = service;
  });

  const resultKeys = [];
  sysmonkeys.forEach((key) => {
    if (Object.keys(erroredObj).includes(key)) {
      resultKeys.push({ robot: key, error: true, arm: erroredObj[key]?.arm });
    } else {
      resultKeys.push({ robot: key, error: false, arm: erroredObj[key]?.arm });
    }
  });
  return resultKeys;
};

/**
 * Transform errored services into required shape
 *
 * @param {Array} errors
 * @example
 *    input = [{'service': 'harvester.0', 'robot': 0}]
 *    output = [harvester.0]
 * @returns {Array} services
 */
export const transformErroredServices = (errors = []) => {
  return errors.map((x, i) => x.service);
};

/**
 *
 * @param {object} queryObj
 * @param {String} pareto
 */
export const pushState = (queryObj, pareto = undefined) => {
  let newurl;
  let params = new URLSearchParams(queryObj);
  if (pareto === PushStateEnum.GENPARETO) {
    newurl = `${window.location.protocol}//${
      window.location.host
    }/errorreports/?aggregate_query=code__name&${params.toString()}`;
  } else if (pareto === PushStateEnum.BUILDCHART) {
    newurl = `${window.location.protocol}//${
      window.location.host
    }/errorreports/view/pareto/?${params.toString()}`;
  } else if (pareto === PushStateEnum.RELEASECODE) {
    newurl = `${window.location.protocol}//${
      window.location.host
    }/release/?${params.toString()}`;
  } else if (pareto === PushStateEnum.EVENTS) {
    newurl = `${window.location.protocol}//${
      window.location.host
    }/events/?${params.toString()}`;
  } else if (pareto === PushStateEnum.PICKSESSIONS) {
    newurl = `${window.location.protocol}//${
      window.location.host
    }/picksessions/?${params.toString()}`;
  } else if (pareto === PushStateEnum.JOBS) {
    newurl = `${window.location.protocol}//${
      window.location.host
    }/jobs/?${params.toString()}`;
  } else if (pareto === PushStateEnum.S3FILES) {
    newurl = `${window.location.protocol}//${
      window.location.host
    }/s3files/?${params.toString()}`;
  } else if (pareto === PushStateEnum.AUTODIAGNOSTICS) {
    newurl = `${window.location.protocol}//${
      window.location.host
    }/autodiagnostics/?${params.toString()}`;
  } else {
    newurl = `${window.location.protocol}//${
      window.location.host
    }/errorreports/?${params.toString()}`;
  }
  window.history.pushState({ path: newurl }, "", newurl);
};

export const aggregateOptions = [
  { label: "service", value: "service" },
  { label: "harvester", value: "report__harvester__name" },
  { label: "exception", value: "code__name" },
  { label: "team", value: "code__team" },
  { label: "robot", value: "robot" },
  { label: "location", value: "report__location__ranch" },
  { label: "handled", value: "handled" },
  { label: "emulator", value: "report__harvester__is_emulator" },
];

export const uuid = () => {
  const hashTable = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];
  let uuid = [];
  for (let i = 0; i < 35; i++) {
    if (i === 7 || i === 12 || i === 17 || i === 22) {
      uuid[i] = "-";
    } else {
      uuid[i] = hashTable[Math.floor(Math.random() * hashTable.length - 1)];
    }
  }
  return uuid.join("");
};

export const validateQueryObj = (queryObj = {}) => {
  if (
    queryObj.harv_ids ||
    queryObj.locations ||
    queryObj.fruits ||
    queryObj.codes ||
    queryObj.traceback ||
    queryObj.generic ||
    queryObj.handled ||
    queryObj.is_emulator
  ) {
    return true;
  } else {
    return false;
  }
};

export const getHistoryType = (historyType) => {
  return historyType === "+"
    ? "created"
    : historyType === "~"
    ? "updated"
    : historyType === "-"
    ? "deleted"
    : "";
};

export const mapCurrentOffset = (previous, next) => {
  let url;
  let limit;
  let offset;
  let paramsObj;
  if (previous) {
    url = new URL(previous);
    limit = url.searchParams.get("limit");
    offset = url.searchParams.get("offset") || 0;
    paramsObj = paramsToObject(url.searchParams.toString());
    let current = Number(limit) + Number(offset);
    paramsObj["offset"] = current;
    paramsObj["limit"] = limit;
    pushState(paramsObj);
  } else if (!previous && next) {
    url = new URL(next);
    limit = url.searchParams.get("limit");
    url.searchParams.delete("offset");
    const paramsObj = paramsToObject(url.searchParams.toString());
    paramsObj["limit"] = limit;
    pushState(paramsObj);
  }
  return paramsObj;
};

export const transformJobTypeOptions = (jobtypes = []) => {
  return jobtypes.map((jobtype, index) => {
    return { value: jobtype.name, label: jobtype.name };
  });
};

export const transformJobSchemaOptions = (jobschemas = []) => {
  return jobschemas.map((jobschema, index) => {
    return { value: jobschema.id, label: `version ${jobschema.version}` };
  });
};

export const getUrl = (urlString = "url") => {
  let pattern = /jobresults\/(?:&?[^=&]*=[^=&]*)*/;
  let match = urlString.match(pattern);
  return match ? match[0] : "";
};

export const getHarvId = (urlString = "url", target = 1) => {
  let pattern = /job__target__harv_id=[0-9]+/;
  let match = urlString.match(pattern);
  if (match) {
    return match[0].split("=")[1];
  } else {
    return target;
  }
};

export const statusOptions = [
  { label: "Success", value: "Success" },
  { label: "Failed", value: "Failed" },
  { label: "Pending", value: "Pending" },
  { label: "Error", value: "Error" },
  { label: "Failed and errors", value: "Failed and errors" },
  { label: "Failed to send", value: "Failed to send" },
];

export const appendCodeName = (codes = [], exceptioncodes = []) => {
  let arr = [];
  exceptioncodes.forEach((x) => {
    if (codes.includes(String(x.code))) {
      arr.push({ value: x.code, label: `${x.code}: ${x.name}` });
    }
  });
  return arr;
};

export function handleSelectFactory(setSelectedFunc) {
  const handleSelect = (newValue, actionMeta) => {
    setSelectedFunc((current) => newValue);
  };
  return handleSelect;
}

/**
 * Transform tags into required arrays
 * @param {Array} tags
 * @returns
 */
export const transformTagsOptions = (tags = []) => {
  return tags.map((tag, index) => {
    return { value: tag, label: tag };
  });
};

export const transformTags = (tags = [], self = false) => {
  if (self) {
    return tags.map((tag, index) => {
      return { id: uuid(), name: tag, checked: true };
    });
  } else {
    return tags.map((tag, index) => {
      return { id: uuid(), name: tag, checked: false };
    });
  }
};

/**
 * This implements the binary search algorithm
 * to find the closest timestamp from the
 * logs timestamp
 * @param {number} target
 *
 * @param {array} arr array of log entries
 *
 *    => target is the timestamp to find e.g
 *       1667345034.422079
 *
 *    => arr is the array of log objects containing
 *        timestamp, log_message, and log_date
 * finds the closest or exact timestamp
 *
 * @returns {object} log object
 */
export function findClosest(target, arr = []) {
  let n = arr.length;

  if (target <= arr[0]?.timestamp) return arr[0];
  if (target >= arr[n - 1]?.timestamp) return arr[n - 1];

  let start = 0;
  let end = n;
  let mid = 0;
  while (start < end) {
    mid = Math.floor((start + end) / 2);

    if (arr[mid]?.timestamp === target) return arr[mid];

    if (target < arr[mid]?.timestamp) {
      if (mid > 0 && target > arr[mid - 1]?.timestamp) {
        return getClosest(arr[mid - 1], arr[mid], target);
      }
      end = mid;
    } else {
      if (mid < n - 1 && target < arr[mid + 1]?.timestamp) {
        return getClosest(arr[mid], arr[mid + 1], target);
      }
      start = mid + 1;
    }
  }

  return arr[mid];
}

/**
 * Finds the closest timestamp
 * return the object.
 *
 * @param {object} a log object
 *
 * @param {object} b log object
 *
 * @param {number} target timestamp
 *
 */
function getClosest(a, b, target) {
  if (target - a?.timestamp >= b?.timestamp - target) {
    return b;
  } else {
    return a;
  }
}

/**
 * Transforms robot array to required obj shape
 * excludes robot 0
 *
 * @param {array} robots - array of numbers
 *
 * @returns {array} Array of object
 *
 * @example
 *    robots = [0, 3]
 *      // => [{label: 'robot 3', value: 3}]
 */
export const transformRobots = (robots = []) => {
  const robotArr = [];
  robots.forEach((robot) => {
    if (robot !== 0) {
      robotArr.push({ label: `robot ${robot}`, value: robot });
    }
  });
  return robotArr;
};

/**
 * Finds the currentIndex of log entry matched
 * from timestamp.
 *
 * @param {number} currentMarker
 *
 * @param {array} data
 *
 * @returns {number} index
 *
 */
export const getCurrIndex = (currentMarker, data) => {
  return new Promise((resolve, reject) => {
    let closest = findClosest(currentMarker, data.content);
    let currIndex = data.content?.findIndex(
      (x) => x.timestamp === closest?.timestamp
    );
    currIndex = currIndex > 0 ? currIndex : 0;
    resolve(currIndex);
  });
};

/**
 * @param {string} imgName
 *
 * @param {string} ext optional
 *
 * @returns {string} absolute image path
 *
 * @example
 *  imagePath(cloud)
 *    // => http://localhost:3000/icons/cloud.png
 */
export const imagePath = (imgName, ext = "png") => {
  let url;
  if (process.env.REACT_APP_NODE_ENV === PROD_ENV) {
    url = process.env.REACT_APP_HOSTED_URL;
  } else {
    url = `http://localhost:3000`;
  }
  return `${url}/icons/${imgName}.${ext}`;
};

/**
 * Transform services and
 * sorts alphabetically then numerically (ascending order)
 *
 * @param {array} services array of objects
 *
 * @returns {array} Array of objects
 */
export const sortServices = (services = []) => {
  let servicesArr = services.map((x) => {
    return { ...x, display: `${x.service}.${x.robot}` };
  });
  return servicesArr.sort((a, b) =>
    a.display > b.display ? 1 : b.display > a.display ? -1 : 0
  );
};

/**
 * Get unique video categories for the 3 video types
 * i. "Robot",
 * ii. "Workcell right",
 * iii. "Workcell left"
 *
 * @param {array} categories array of objects
 *
 * @returns {array} Array of video object
 */
export const uniqueVideoTabs = (categories = []) => {
  let key = "category";
  let arrayUniqueByKey = [
    ...new Map(categories.map((item) => [item[key], item])).values(),
  ];
  return arrayUniqueByKey;
};

/**
 * Finds and return index of the log else returns 0
 *
 * @param {array} content array of objects
 *
 * @param {object} obj - log object
 *
 * @returns {number} Index
 */
export const findLogIndex = (content = [], obj = {}) => {
  let objIndex = content.findIndex((item) => item.timestamp === obj.timestamp);
  return objIndex > 0 ? objIndex : 0;
};

/**
 * Match pattern for log message
 *
 * @param {String} logMessage
 * @param {String} ext
 * @returns {object} log object
 */
export const logContent = (logMessage = "", ext = ".log") => {
  let logObj = {};
  let splittedArr;

  if (ext === ".log") {
    let wholeMatch = logMessage.match(LOG_STR_PATTERN);
    if (wholeMatch) {
      splittedArr = wholeMatch[0].split(" ");
      logObj["timestamp"] = splittedArr[0].replace("[", "").replace("]", "");
      logObj["log_level"] = splittedArr[1].replace("[", "").replace("]", "");
      logObj["service"] = splittedArr[2].replace("[", "").replace("]", "");
    }
    splittedArr = logMessage.split("-- ");
    logObj["log"] = `-- ${splittedArr[1]}`;
  } else if (ext === ".dump") {
    splittedArr = logMessage.split("  ");
    logObj["timestamp"] = splittedArr[0].replace("[", "").replace("]", "");
    logObj["log_level"] = splittedArr[1];
    logObj["service"] = splittedArr[2];
    logObj["log"] = splittedArr[3];
  }

  return logObj;
};

/**
 *
 * @param {object} fieldData
 * @param {Array} selectedHarvId
 * @param {Array} selectedLocation
 * @param {object} selectedTimezone
 * @param {Array} selectedFruit
 * @param {Array} selectedCode
 * @returns {object} query object
 */
export const buildQueryObj = (
  fieldData,
  selectedHarvId,
  selectedLocation,
  selectedTimezone,
  selectedFruit,
  selectedCode
) => {
  const queryObj = {};
  if (fieldData.start_time) {
    queryObj["start_time"] = timeStampFormat(
      extractDateFromString(fieldData.start_time)
    );
  }
  if (fieldData.end_time) {
    queryObj["end_time"] = timeStampFormat(
      extractDateFromString(fieldData.end_time)
    );
  }
  if (selectedHarvId && selectedHarvId.length > 0) {
    queryObj["harv_ids"] = translateHarvOptions(selectedHarvId);
  }
  if (selectedLocation && selectedLocation.length > 0) {
    queryObj["locations"] = translateLocOptions(selectedLocation);
  }
  if (selectedTimezone && selectedTimezone.hasOwnProperty("value")) {
    queryObj["tz"] = selectedTimezone.value;
  }
  if (selectedFruit && selectedFruit.length > 0) {
    queryObj["fruits"] = translateFruitOptions(selectedFruit);
  }
  if (selectedCode && selectedCode.length > 0) {
    queryObj["codes"] = translateCodeOptions(selectedCode);
  }
  if (fieldData.traceback) {
    queryObj["traceback"] = fieldData.traceback;
  }
  if (fieldData.generic) {
    queryObj["generic"] = fieldData.generic;
  }
  if (fieldData.is_emulator) {
    queryObj["is_emulator"] = fieldData.is_emulator;
  }
  if (fieldData.handled) {
    queryObj["handled"] = fieldData.handled;
  }
  if (fieldData.primary) {
    queryObj["primary"] = fieldData.primary;
  }
  return queryObj;
};

/**
 * Check if the browser default theme is dark
 *
 * @returns {boolean} boolean
 */
export const isBrowserDefaultDark = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * Evaluate for dark theme className
 * @param {string} className
 * @param {string} theme
 * @returns {string} string
 */
export const darkThemeClass = (className, theme) => {
  return theme === THEME_MODES.DARK_THEME ? className : "";
};

export const selectDarkStyles = {
  option: (defaultStyles, state) => ({
    ...defaultStyles,
    color: state.isSelected ? "#212529" : "#fff",
    backgroundColor: state.isFocused ? "#a0a0a0" : "#212529",
  }),
  control: (defaultStyles) => ({
    ...defaultStyles,
    backgroundColor: "#212529",
  }),
  singleValue: (defaultStyles) => ({ ...defaultStyles, color: "#fff" }),
};

/**
 *
 * @param {object} paramsObj
 * @param {Array} exceptioncodes
 * @param {Function} setSelectedHarvId
 * @param {Function} setSelectedLocation
 * @param {Function} setSelectedFruit
 * @param {Function} setSelectedCode
 * @param {Function} setFieldData
 * @param {Function} setSelectedTimezone
 * @param {Function} setSelectedAggregate
 */
export const mapParamsObject = (
  paramsObj,
  exceptioncodes,
  setSelectedHarvId,
  setSelectedLocation,
  setSelectedFruit,
  setSelectedCode,
  setFieldData,
  setSelectedTimezone,
  setSelectedAggregate
) => {
  if (paramsObj.harv_ids) {
    let harv_ids = paramsObj.harv_ids.split(",").map((harv_id, index) => {
      return { value: Number(harv_id), label: Number(harv_id) };
    });
    setSelectedHarvId((current) => harv_ids);
  }
  if (paramsObj.locations) {
    let locations = paramsObj.locations.split(",").map((loc, index) => {
      return { value: loc, label: loc };
    });
    setSelectedLocation((current) => locations);
  }
  if (paramsObj.fruits) {
    let fruits = paramsObj.fruits.split(",").map((fruit, index) => {
      return { value: fruit, label: fruit };
    });
    setSelectedFruit((current) => fruits);
  }
  if (paramsObj.codes) {
    let codes = paramsObj.codes.split(",");
    let codenames = appendCodeName(codes, exceptioncodes);
    setSelectedCode((current) => codenames);
  }
  if (paramsObj.traceback) {
    setFieldData((current) => {
      return { ...current, traceback: paramsObj.traceback };
    });
  }
  if (paramsObj.start_time) {
    setFieldData((current) => {
      return {
        ...current,
        start_time: paramsObj.start_time,
      };
    });
  }
  if (paramsObj.end_time) {
    setFieldData((current) => {
      return {
        ...current,
        end_time: paramsObj.end_time,
      };
    });
  }
  if (paramsObj.tz) {
    let tzObj = { value: paramsObj.tz, label: paramsObj.tz };
    setSelectedTimezone((current) => tzObj);
  }
  if (paramsObj.generic) {
    setFieldData((current) => {
      return { ...current, generic: paramsObj.generic };
    });
  }
  if (paramsObj.is_emulator) {
    setFieldData((current) => {
      return { ...current, is_emulator: paramsObj.is_emulator };
    });
  }
  if (paramsObj.handled) {
    setFieldData((current) => {
      return { ...current, handled: paramsObj.handled };
    });
  }
  if (paramsObj.primary) {
    setFieldData((current) => {
      return { ...current, primary: Boolean(paramsObj.primary) };
    });
  }
  if (paramsObj.group_by) {
    const groups = paramsObj.group_by.split(",");
    const newGroup = aggregateOptions.filter((x) => groups.includes(x.value));
    setSelectedAggregate((current) => newGroup);
  }
};

export const monacoOptions = {
  acceptSuggestionOnCommitCharacter: true,
  acceptSuggestionOnEnter: "on",
  accessibilitySupport: "auto",
  autoIndent: false,
  automaticLayout: true,
  codeLens: true,
  colorDecorators: true,
  contextmenu: true,
  cursorBlinking: "blink",
  cursorSmoothCaretAnimation: false,
  cursorStyle: "line",
  disableLayerHinting: false,
  disableMonospaceOptimizations: false,
  dragAndDrop: false,
  fixedOverflowWidgets: false,
  folding: true,
  foldingStrategy: "auto",
  fontLigatures: false,
  formatOnPaste: false,
  formatOnType: true,
  hideCursorInOverviewRuler: false,
  highlightActiveIndentGuide: true,
  links: true,
  mouseWheelZoom: false,
  multiCursorMergeOverlapping: true,
  multiCursorModifier: "alt",
  overviewRulerBorder: true,
  overviewRulerLanes: 2,
  quickSuggestions: true,
  quickSuggestionsDelay: 100,
  readOnly: false,
  renderControlCharacters: false,
  renderFinalNewline: true,
  renderIndentGuides: true,
  renderLineHighlight: "all",
  renderWhitespace: "none",
  revealHorizontalRightPadding: 30,
  roundedSelection: true,
  rulers: [],
  scrollBeyondLastColumn: 5,
  scrollBeyondLastLine: true,
  selectOnLineNumbers: true,
  selectionClipboard: true,
  selectionHighlight: true,
  showFoldingControls: "mouseover",
  smoothScrolling: false,
  suggestOnTriggerCharacters: true,
  wordBasedSuggestions: true,
  wordSeparators: "~!@#$%^&*()-=+[{]}|;:'\",.<>/?",
  wordWrap: "on",
  wordWrapBreakAfterCharacters: "\t})]?|&,;",
  wordWrapBreakBeforeCharacters: "{([+",
  wordWrapBreakObtrusiveCharacters: ".",
  wordWrapColumn: 80,
  wordWrapMinified: true,
  wrappingIndent: "none",
};

/**
 * Get Config Report Keys from config object
 * @param {object} config
 * @returns
 */
export const getAftConfigKeys = (config = {}) => {
  return Object.keys(config);
};

/**
 * sleep for given miliseconds
 * @param {Number} ms
 * @returns
 */
export const sleep = (ms = 100) => {
  return new Promise((resolve, reject) => setTimeout(resolve, ms));
};

/**
 * Sorts the sensors array by timestamp
 * @param {Array} arr
 * @returns
 */
const sortByTimestamp = (arr = []) => {
  return arr.sort((a, b) => a.ts - b.ts);
};

/**
 *  revert back the sensors to original data structure
 *  and perform necessary calculations
 * @param {Array} sortedSensors
 * @returns
 */
const revertOgShapeAndCalculate = (sortedSensors = []) => {
  const originalFormat = new Map();
  const t0 = sortedSensors[0]?.ts;

  for (const sensor of sortedSensors) {
    const values = originalFormat.get(sensor.state) || [];
    values.push(sensor);
    originalFormat.set(sensor.state, values);
  }

  const obj = {
    values: [],
    states: [],
    timestamps: [],
    ts_interval: [],
  };

  for (const [state, values] of originalFormat) {
    for (const value of values) {
      obj.states.push(state);
      obj.values.push(value.value);
      obj.timestamps.push(+(value.ts - t0).toFixed(7));
    }
    const diff = +(values[values.length - 1]?.ts - values[0]?.ts).toFixed(7);
    const x0 = +(values[0].ts - t0).toFixed(7);
    obj.ts_interval.push({
      state,
      x0,
      diff,
    });
  }

  for (let i = 0; i < obj.ts_interval.length; i++) {
    if (obj.ts_interval[i + 1]) {
      obj.ts_interval[i].x1 = obj.ts_interval[i + 1].x0;
    } else {
      obj.ts_interval[i].x1 = obj.ts_interval[i].x0 + obj.ts_interval[i].diff;
    }
    obj.ts_interval[i].max = Math.ceil(Math.max(...obj.values));
    obj.ts_interval[i].min = Math.floor(Math.min(...obj.values));
  }

  return obj;
};

/**
 * Transform sensors data object into required state
 * @param {object} sensors
 * @returns
 */
export const transformSensors = (sensors = {}) => {
  const toSensorArray = (key, value, prop) => {
    return value.reduce((acc, [ts, values]) => {
      if (!isNaN(values[prop])) {
        acc.push({ state: key, ts, value: values[prop] });
      }
      return acc;
    }, []);
  };

  const sensorArrays = Object.entries(sensors).reduce(
    (acc, [key, value]) => {
      acc.touch.push(...toSensorArray(key, value, "touch"));
      acc.vacuum.push(...toSensorArray(key, value, "vac"));
      acc.finger.push(...toSensorArray(key, value, "finger"));
      return acc;
    },
    { touch: [], vacuum: [], finger: [] }
  );

  const touch = revertOgShapeAndCalculate(sortByTimestamp(sensorArrays.touch));
  const vacuum = revertOgShapeAndCalculate(
    sortByTimestamp(sensorArrays.vacuum)
  );
  const finger = revertOgShapeAndCalculate(
    sortByTimestamp(sensorArrays.finger)
  );

  return { touch, vacuum, finger };
};

/**
 * Convert string to Title case
 * @param {String} str
 * @param {String} separator
 * @returns {String} str
 */
export const titleCase = (str, separator = " ") => {
  str = str.toLowerCase().split(separator);
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
};

/**
 * Filters out comma separated strings
 * and return combined set array of filters
 * @param {String} str
 * @param {Array} content
 * @returns
 */
export const logFilter = (str = "", content = []) => {
  const splitStr = str.split(",").map((s) => s.toLowerCase().trim());
  const filteredArr = splitStr.reduce((acc, curr) => {
    const filtered = content.filter((obj) =>
      obj.log_message.toLowerCase().includes(curr)
    );
    return filtered.length > 0 ? [...acc, ...filtered] : acc;
  }, []);

  return [...new Set(filteredArr)];
};

/**
 * sort and apply reduce method to paretos
 * @param {Array} paretos
 * @returns
 */
export const sortReduceParetos = (paretos = []) => {
  paretos.sort((a, b) => b.count - a.count);
  const [xlabels, ydata] = paretos.reduce(
    (acc, pareto) => {
      const [xlabelsAcc, ydataAcc] = acc;
      return [
        [...xlabelsAcc, pareto.value],
        [...ydataAcc, pareto.count],
      ];
    },
    [[], []]
  );
  return { xlabels, ydata };
};

/**
 * Check if aft-config has traceback or error data
 * sent. This takes into account that error and traceback
 * of type string
 * @param {object} config
 * @returns {Boolean}
 */
export const hasTraceback = (config) => {
  for (const key in config) {
    if (typeof config[key] !== "object") {
      return true;
    }
  }
  return false;
};

/**
 * Transform aft-config report and pop out conf_default_host
 * since it's too large for rendering
 * @param {object} config
 * @returns
 */
export const transformConfig = (config) => {
  if (hasTraceback(config)) {
    return { errored: true, obj: config };
  } else {
    const newObj = {};
    for (const key in config) {
      const value = config[key];
      for (const innerKey in value) {
        if (innerKey.includes("conf_default")) {
          delete value[innerKey];
        } else {
          newObj[key] = value;
        }
      }
    }
    return { errored: false, obj: newObj };
  }
};
