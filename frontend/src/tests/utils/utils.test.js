/**
 * Test utils methods in the utils.js file
 */

import {
  findClosest,
  imagePath,
  transformRobots,
  sortServices,
  uniqueVideoTabs,
  findLogIndex,
  logContent,
  buildQueryObj,
  transformExceptions,
  transformSysmonReport,
  transformSysmonServices,
  getServicesInError,
  robotInError,
  transformSysmonKeys,
  transformErroredServices,
  extractServiceCodes,
} from "utils/utils";
import errorreport from "test-utils/test-data/errorreport.json";

test("should do binary search for given timestamp", () => {
  let content = [
    {
      timestamp: 2,
      date_time: new Date(),
      log_message: "[20220208T105000.012]",
    },
    {
      timestamp: 4,
      date_time: new Date(),
      log_message: "[20220208T105000.012]",
    },
    {
      timestamp: 6,
      date_time: new Date(),
      log_message: "[20220208T105000.012]",
    },
    {
      timestamp: 8,
      date_time: new Date(),
      log_message: "[20220208T105000.012]",
    },
  ];

  let a = 1;
  let b = 11;
  let c = 5;
  let d = 4;

  // given target far left not in array
  let closest = findClosest(a, content);
  expect(closest.timestamp).toBe(content[0].timestamp);

  // given target far right not in array
  closest = findClosest(b, content);
  expect(closest.timestamp).toBe(content[content.length - 1].timestamp);

  // given target within range the array
  closest = findClosest(c, content);
  expect(closest.timestamp).toBe(6);

  // given target exact match
  closest = findClosest(d, content);
  expect(closest.timestamp).toBe(d);
});

test("should return full image path", () => {
  expect(imagePath("cloud")).toBe("http://localhost:3000/icons/cloud.png");
});

test("should transform robots to required shape", () => {
  // expected input
  let robots = [0, 3, 4];
  // expected output
  let output = [
    { label: "robot 3", value: 3 },
    { label: "robot 4", value: 4 },
  ];
  expect(transformRobots(robots)).toMatchObject(output);
});

test("should sort services (alpha) and robot (num)", () => {
  let input = [
    {
      id: 1,
      service: "picker",
      robot: 3,
      display: "picker.3",
    },
    {
      id: 2,
      service: "logrec",
      robot: 0,
      display: "logrec.0",
    },
    {
      id: 3,
      service: "logrec",
      robot: 3,
      display: "logrec.3",
    },
  ];
  // sorts in ascending order (aplhanumric characters)
  let sorted = input.sort((a, b) =>
    a.display > b.display ? 1 : b.display > a.display ? -1 : 0
  );
  expect(sortServices(input)).toMatchObject(sorted);
});

test("should return unique video tabs (category)", () => {
  let input = [
    {
      id: 1,
      category: "color",
      robot: 0,
    },
    {
      id: 2,
      category: "color",
      robot: 0,
    },
    {
      id: 3,
      category: "right-cellcam",
      robot: 2,
    },
    {
      id: 4,
      category: "left-cellcam",
      robot: 4,
    },
  ];
  let expected = [
    {
      id: 2,
      category: "color",
      robot: 0,
    },
    {
      id: 3,
      category: "right-cellcam",
      robot: 2,
    },
    {
      id: 4,
      category: "left-cellcam",
      robot: 4,
    },
  ];
  expect(uniqueVideoTabs(input)).toHaveLength(expected.length);
  expect(uniqueVideoTabs(input)).toMatchObject(expected);
});

test("should return the index of logs", () => {
  let input = [
    {
      timestamp: 1,
      log_message:
        "[20220208T105000.014] [DEBUG] [autodrive.beh.fsm] -- Vpos: 99715.06447550641",
      log_date: new Date(),
    },
    {
      timestamp: 2,
      log_message:
        "[20220208T105000.014] [DEBUG] [autodrive.beh.fsm] -- Vpos: 99715.06447550641",
      log_date: new Date(),
    },
  ];
  let expectedObj = input[1];

  expect(findLogIndex(input, expectedObj)).toBe(1);
  expect(findLogIndex(input, {})).toBe(0);
});

test("should match and return log message into 4 parts", () => {
  let logMessage =
    "[20220208T105000.014] [DEBUG] [autodrive.beh.fsm] -- Vpos: 99715.06447550641";
  let output = {
    timestamp: "20220208T105000.014",
    log_level: "DEBUG",
    service: "autodrive.beh.fsm",
    log: "-- Vpos: 99715.06447550641",
  };
  expect(logContent(logMessage)).toMatchObject(output);
});

test("should build query object", () => {
  let fieldData = {
    is_emulator: "0",
    traceback: "traceback",
    generic: "generic=generic",
    handled: "0",
    primary: true,
  };
  let selectedHarvId = [{ label: "11", value: 11 }];
  let selectedLocation = [{ label: "Ranch A", value: "Ranch A" }];
  let selectedTimezone = { label: "US/Pacific", value: "US/Pacific" };
  let selectedFruit = [{ label: "strawberry", value: "strawberry" }];
  let selectedCode = [{ label: "0", value: "0" }];

  let queryObj = buildQueryObj(
    fieldData,
    selectedHarvId,
    selectedLocation,
    selectedTimezone,
    selectedFruit,
    selectedCode
  );
  let expected = {
    is_emulator: "0",
    traceback: "traceback",
    generic: "generic=generic",
    handled: "0",
    harv_ids: [11],
    locations: ["Ranch A"],
    tz: "US/Pacific",
    exceptions__primary: true,
  };
  expect(queryObj).toMatchObject(expected);
});

describe("error report transformation block scope", () => {
  const sysmondata = errorreport.report.data.sysmon_report;
  function _getexceptions() {
    return transformExceptions(errorreport.exceptions);
  }
  function _getsysreport() {
    return transformSysmonReport(sysmondata);
  }
  function _erroredservices() {
    return getServicesInError(_getexceptions(), _getsysreport());
  }

  test("should transform exceptions into required array obj", () => {
    let received = errorreport.exceptions;
    let expected = _getexceptions();
    expect(expected.length).toBeGreaterThan(0);
    expect(transformExceptions(received)).toMatchObject(expected);
  });

  test("should transform sysmon report into required obj", () => {
    let expected = _getsysreport();
    expect(transformSysmonReport(sysmondata)).toMatchObject(expected);
    expect(transformSysmonReport(sysmondata)).toHaveProperty("Master");
    expect(transformSysmonReport(sysmondata)).toHaveProperty("Robot 1");
  });

  test("should transform sysmon services into required array", () => {
    let sysreport = _getsysreport();
    let services = transformSysmonServices(sysreport["Master"].services);
    expect(services).toHaveLength(8);
  });

  test("should return all services in error", () => {
    let erroredservices = _erroredservices();
    let expected = [
      { service: "drivesys.0", robot: 0 },
      { service: "harvester.0", robot: 0 },
    ];
    expect(erroredservices).toHaveLength(2);
    expect(erroredservices).toMatchObject(expected);
  });

  test("should get single robot in error", () => {
    let sysreport = _getsysreport();
    let exceptions = _getexceptions();
    let roboerror = robotInError(exceptions[0], sysreport);
    let expected = {
      error: true,
      robot: "Master",
      arm: null,
    };
    expect(roboerror).toMatchObject(expected);
  });

  test("should transform sysmon keys to required shape", () => {
    let sysreport = _getsysreport();
    let erroredservices = _erroredservices();
    let syskeys = transformSysmonKeys(
      Object.keys(sysreport),
      erroredservices,
      sysreport
    );
    let expected = [
      { robot: "Master", error: true, arm: null },
      { robot: "Robot 1", error: false, arm: undefined },
      { robot: "Robot 2", error: false, arm: undefined },
      { robot: "Robot 3", error: false, arm: undefined },
      { robot: "Robot 4", error: false, arm: undefined },
      { robot: "Robot 5", error: false, arm: undefined },
      { robot: "Robot 6", error: false, arm: undefined },
    ];
    expect(syskeys).toHaveLength(7);
    expect(syskeys).toMatchObject(expected);
  });

  test("should transform errored services into required shape", () => {
    let erroredservices = _erroredservices();
    let output = transformErroredServices(erroredservices);
    let expected = ["drivesys.0", "harvester.0"];
    expect(erroredservices.length).toBe(output.length);
    expect(output).toMatchObject(expected);
  });

  test("should extract service and codes from exception array", () => {
    let output = extractServiceCodes(_getexceptions());
    let expected = {
      services: ["drivesys.0*", "harvester.0"],
      codes: ["0*", "0"],
    };
    expect(output).toMatchObject(expected);
  });
});
