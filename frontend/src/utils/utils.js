import {
  LOG_MSG_PATTERN,
  LOG_STR_PATTERN,
  PROD_ENV,
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

const extractServiceCodes = (exceptions = []) => {
  let services = [];
  let codes = [];
  exceptions.forEach((exec) => {
    services.push(`${exec.service}.${exec.robot}`);
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
    exceptObj[`${obj.service}.${obj.robot}: ${obj.code.code}`] = obj;
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

export const getServicesInError = (exceptionsKeys = [], sysmonReport = {}) => {
  let errors = [];
  for (let i = 0; i < exceptionsKeys.length; i++) {
    let dotAny = exceptionsKeys[i].split(":")[0].split(".")[1];
    let service = exceptionsKeys[i].split(":")[0];
    let robotIndex = `Robot ${dotAny}`;
    if (dotAny === "0") {
      if (sysmonReport["Master"]) {
        errors.push(service);
      }
    } else {
      if (sysmonReport[robotIndex]) {
        errors.push(service);
      }
    }
  }
  return errors;
};

export const getExceptionKeys = (exceptions = []) => {
  return Object.keys(transformExceptionObj(exceptions));
};

export const robotInError = (exceptionKey, sysmonReport) => {
  let robot = {};
  let dotAny = exceptionKey.split(":")[0].split(".")[1];
  robot["error"] = true;
  if (dotAny === "0") {
    robot["robot"] = "Master";
    robot["arm"] = null;
  } else {
    let robotIndex = `Robot ${dotAny}`;
    let service = exceptionKey.split(":")[0];
    robot["robot"] = robotIndex;
    if (sysmonReport[robotIndex]["NUC"]["services"][service]) {
      robot["arm"] = "NUC";
    } else if (sysmonReport[robotIndex]["JETSON"]["services"][service]) {
      robot["arm"] = "JETSON";
    }
  }
  return robot;
};

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

export const pushState = (queryObj, pareto = false) => {
  let newurl;
  let params = new URLSearchParams(queryObj);
  if (pareto) {
    newurl = `${window.location.protocol}//${
      window.location.host
    }/errorreports/?aggregate_query=code__name&${params.toString()}`;
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

export const transformTagsOptions = (tags = []) => {
  return tags.map((tags, index) => {
    return { value: tags, label: tags };
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
 * @param {string} logMessage
 * @returns {object} log object
 */
export const logContent = (logMessage = "") => {
  let logObj = {};

  let wholeMatch = logMessage.match(LOG_STR_PATTERN);
  if (wholeMatch) {
    let splittedArr = wholeMatch[0].split(" ");

    logObj["timestamp"] = splittedArr[0].replace("[", "").replace("]", "");
    logObj["log_level"] = splittedArr[1].replace("[", "").replace("]", "");
    logObj["service"] = splittedArr[2].replace("[", "").replace("]", "");
  }

  let logMatch = logMessage.match(LOG_MSG_PATTERN);
  if (logMatch) {
    logObj["log"] = logMatch[0];
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
