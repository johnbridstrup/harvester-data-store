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
  copiedUrl,
  getAftConfigKeys,
  transformSensors,
  titleCase,
  logFilter,
  sortReduceParetos,
  transformConfig,
} from "utils/utils";
import errorreport from "test-utils/test-data/errorreport.json";
import { API_URL } from "features/base/constants";
import { autodiagdetail } from "test-utils/test-data/autodiagnostic";
import emureport from "test-utils/test-data/emureport.json";

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
  let logMsg =
    "[20220208T105000.014] [DEBUG] [autodrive.beh.fsm] -- Vpos: 99715.06447550641";
  let complexMsg =
    "[20230209T095331.171] [DEBUG] [robot.beh.fsm] -- temp bezier: P0: [ -25.938  197.527 -906.75 ]\tP1: [ -25.938  197.925 -906.75 ]\tP2: [ -25.938  197.064 -906.752]\tP3: [ -25.938  195.513 -906.752]\tvel_max: 20.742422324838202\taccel_max: 150.1727469427821\tjerk_max: 302.8897235392171";
  let dumpMsg = "[20230131T131313.522260]  rcan0  282  0B 00 00 00 3B F5 FF FF";
  let output1 = {
    timestamp: "20220208T105000.014",
    log_level: "DEBUG",
    service: "autodrive.beh.fsm",
    log: "-- Vpos: 99715.06447550641",
  };
  let output2 = {
    timestamp: "20230131T131313.522260",
    log_level: "rcan0",
    service: "282",
    log: "0B 00 00 00 3B F5 FF FF",
  };
  let output3 = {
    timestamp: "20230209T095331.171",
    log_level: "DEBUG",
    service: "robot.beh.fsm",
    log: "-- temp bezier: P0: [ -25.938  197.527 -906.75 ]\tP1: [ -25.938  197.925 -906.75 ]\tP2: [ -25.938  197.064 -906.752]\tP3: [ -25.938  195.513 -906.752]\tvel_max: 20.742422324838202\taccel_max: 150.1727469427821\tjerk_max: 302.8897235392171",
  };
  expect(logContent(logMsg, ".log")).toMatchObject(output1);
  expect(logContent(dumpMsg, ".dump")).toMatchObject(output2);
  expect(logContent(complexMsg, ".log")).toMatchObject(output3);
});

describe("logFilter case scenarios", () => {
  const content = [
    {
      robot: 3,
      service: "dump",
      log_date: "2023-01-31 13:13:13.518230-08:00",
      timestamp: 1675199593.51823,
      log_message: "[20230131T131313.518230]  rcan0  384  37 97 51 FC FF FF",
      logfile_type: ".dump",
    },
    {
      robot: 3,
      service: "dump",
      log_date: "2023-01-31 13:13:13.522260-08:00",
      timestamp: 1675199593.52226,
      log_message:
        "[20230131T131313.522260]  rcan0  282  0B 00 00 00 3B F5 FF FF",
      logfile_type: ".dump",
    },
    {
      robot: 3,
      service: "dump",
      log_date: "2023-01-31 13:13:13.522261-08:00",
      timestamp: 1675199593.522261,
      log_message:
        "[20230131T131313.522261]  rcan0  281  F3 FE FF FF 2E 23 00 00",
      logfile_type: ".dump",
    },
  ];

  const expected = [
    {
      robot: 3,
      service: "dump",
      log_date: "2023-01-31 13:13:13.518230-08:00",
      timestamp: 1675199593.51823,
      log_message: "[20230131T131313.518230]  rcan0  384  37 97 51 FC FF FF",
      logfile_type: ".dump",
    },
    {
      robot: 3,
      service: "dump",
      log_date: "2023-01-31 13:13:13.522260-08:00",
      timestamp: 1675199593.52226,
      log_message:
        "[20230131T131313.522260]  rcan0  282  0B 00 00 00 3B F5 FF FF",
      logfile_type: ".dump",
    },
  ];

  test("should return empty array when no matches are found", () => {
    expect(logFilter("300", content)).toMatchObject([]);
  });

  test("should filter objects by cob ids or relevant log str", () => {
    expect(logFilter("384, 282", content)).toMatchObject(expected);
  });
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
    primary: true,
  };
  expect(queryObj).toMatchObject(expected);
});

describe("error report transformation block scope", () => {
  const sysmondata = errorreport.report.data.sysmon_report;
  const emusysmondata = emureport.report.data.sysmon_report;
  function _getexceptions() {
    return transformExceptions(errorreport.exceptions);
  }
  function _getsysreport() {
    return transformSysmonReport(sysmondata);
  }
  function _erroredservices() {
    return getServicesInError(_getexceptions(), _getsysreport());
  }
  function _emusysreport() {
    return transformSysmonReport(emusysmondata);
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
    expect(Object.keys(expected)).toHaveLength(7);
    expect(expected).toHaveProperty("Master");
    expect(expected).toHaveProperty("Robot 1");
    expect(expected["Robot 1"]).toHaveProperty("NUC");
    expect(expected["Robot 1"]).toHaveProperty("JETSON");
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

  test("should handle robots with missing NUC & JETSON arms", () => {
    let expected = _emusysreport();
    expect(transformSysmonReport(emusysmondata)).toMatchObject(expected);
    expect(Object.keys(expected)).toHaveLength(4);
    expect(expected).toHaveProperty("Master");
    expect(expected).toHaveProperty("Robot 1");
    expect(expected).toHaveProperty("Robot 2");
    expect(expected).toHaveProperty("Robot 5");
    expect(expected["Robot 1"]).toHaveProperty("NUC");
    expect(expected["Robot 1"]).not.toHaveProperty("JETSON");
    expect(expected["Robot 2"]).toHaveProperty("NUC");
    expect(expected["Robot 2"]).not.toHaveProperty("JETSON");
    expect(expected["Robot 5"]).toHaveProperty("NUC");
    expect(expected["Robot 5"]).not.toHaveProperty("JETSON");
  });
});

test("should return api url with query string", () => {
  let queryObj = {
    harv_ids: [11],
    locations: ["Ranch A"],
  };
  let expected = `${API_URL}/errorreports/?harv_ids=11&locations=Ranch+A`;

  expect(copiedUrl(queryObj)).toBe(expected);
});

describe("aftconfig transformation block scope", () => {
  test("should transform config report keys into arrays", () => {
    let config = {
      0: {
        overlay_diff: "diff",
      },
      1: {
        overlay_diff: "diff",
      },
      2: {
        overlay_diff: "diff",
      },
    };
    let expected = ["0", "1", "2"];
    expect(getAftConfigKeys(config)).toMatchObject(expected);
  });

  test("should render all tabs except conf default host", () => {
    const config = {
      0: {
        conf_default_master: {},
        overlay_diff_master: {},
      },
      1: {
        conf_default_jet: {},
        conf_default_robot: {},
        overlay_diff_jet: {},
        overlay_diff_robot: {},
      },
    };
    const expected = {
      errored: false,
      obj: {
        0: {
          overlay_diff_master: {},
        },
        1: {
          overlay_diff_jet: {},
          overlay_diff_robot: {},
        },
      },
    };
    expect(transformConfig(config)).toMatchObject(expected);
  });

  test("should handle config with error or traceback sent", () => {
    const erroredConfig = {
      type: "config",
      timestamp: 1681931176.7109792,
      data: {
        error: "Unable to generate Configs report",
        traceback:
          'Traceback (most recent call last):\n  File "/home/aft/aft-py-packages/apple/venv/bin/masterconf_view.py", line 11, in <module>\n    load_entry_point(\'aft-core\', \'console_scripts\', \'masterconf_view.py\')()\n  File "/home/aft/aft-py-packages/aft-core/src/aft_core/utils/masterconf_view.py", line 229, in main\n    generate_full_config_report(),\n  File "/home/aft/aft-py-packages/aft-core/src/aft_core/utils/masterconf_view.py", line 114, in generate_full_config_report\n    conf_default, _, deep_diff = generate_conf_diff_report(\n  File "/home/aft/aft-py-packages/aft-core/src/aft_core/utils/masterconf_view.py", line 94, in generate_conf_diff_report\n    raise RuntimeError("Dummy error here")\nRuntimeError: Dummy error here\n',
      },
      serial_number: "011",
      is_emulator: false,
      uuid: "42c004a4-dee5-11ed-95e0-570b5e4ae538",
      fruit: "apple",
    };

    const expected = {
      errored: true,
      obj: {
        error: "Unable to generate Configs report",
        traceback:
          'Traceback (most recent call last):\n  File "/home/aft/aft-py-packages/apple/venv/bin/masterconf_view.py", line 11, in <module>\n    load_entry_point(\'aft-core\', \'console_scripts\', \'masterconf_view.py\')()\n  File "/home/aft/aft-py-packages/aft-core/src/aft_core/utils/masterconf_view.py", line 229, in main\n    generate_full_config_report(),\n  File "/home/aft/aft-py-packages/aft-core/src/aft_core/utils/masterconf_view.py", line 114, in generate_full_config_report\n    conf_default, _, deep_diff = generate_conf_diff_report(\n  File "/home/aft/aft-py-packages/aft-core/src/aft_core/utils/masterconf_view.py", line 94, in generate_conf_diff_report\n    raise RuntimeError("Dummy error here")\nRuntimeError: Dummy error here\n',
      },
    };
    expect(transformConfig(erroredConfig.data)).toMatchObject(expected);
  });
});

describe("autodiagnostics transformation block scope", () => {
  const sensorData = {
    sensor1: [
      [1, { touch: 1, vac: 2, finger: 3 }],
      [2, { touch: 2, vac: 4, finger: 6 }],
    ],
    sensor2: [
      [3, { touch: 3, vac: 6, finger: 9 }],
      [4, { touch: 4, vac: 8, finger: 12 }],
    ],
  };

  const expectedOutput = {
    touch: {
      values: [1, 2, 3, 4],
      states: ["sensor1", "sensor1", "sensor2", "sensor2"],
      timestamps: [0, 1, 2, 3],
      ts_interval: [
        { state: "sensor1", x0: 0, diff: 1, x1: 2, max: 4, min: 1 },
        { state: "sensor2", x0: 2, diff: 1, x1: 3, max: 4, min: 1 },
      ],
    },
    vacuum: {
      values: [2, 4, 6, 8],
      states: ["sensor1", "sensor1", "sensor2", "sensor2"],
      timestamps: [0, 1, 2, 3],
      ts_interval: [
        { state: "sensor1", x0: 0, diff: 1, x1: 2, max: 8, min: 2 },
        { state: "sensor2", x0: 2, diff: 1, x1: 3, max: 8, min: 2 },
      ],
    },
    finger: {
      values: [3, 6, 9, 12],
      states: ["sensor1", "sensor1", "sensor2", "sensor2"],
      timestamps: [0, 1, 2, 3],
      ts_interval: [
        { state: "sensor1", x0: 0, diff: 1, x1: 2, max: 12, min: 3 },
        { state: "sensor2", x0: 2, diff: 1, x1: 3, max: 12, min: 3 },
      ],
    },
  };

  test("should transform the sensors data into required shape", () => {
    let output = transformSensors(autodiagdetail.run_data.sensors);
    expect(Object.keys(output)).toHaveLength(3);
    expect(output).toHaveProperty("touch");
    expect(output).toHaveProperty("vacuum");
    expect(output).toHaveProperty("finger");
    expect(output.finger.values).toHaveLength(30);
    expect(output.vacuum.values).toHaveLength(30);
    expect(output.touch.values).toHaveLength(30);
  });

  test("should transform the sensor data into expected format", () => {
    expect(transformSensors(sensorData)).toMatchObject(expectedOutput);
  });

  test("should handle empty input", () => {
    expect(transformSensors()).toMatchObject({
      touch: { values: [], states: [], timestamps: [], ts_interval: [] },
      vacuum: { values: [], states: [], timestamps: [], ts_interval: [] },
      finger: { values: [], states: [], timestamps: [], ts_interval: [] },
    });
  });

  test("should handle missing properties in sensor readings", () => {
    const sensorDataWithMissingProps = {
      state1: [
        [1, { touch: 1, vac: 0 }],
        [2, { touch: 2, vac: 2, finger: 6 }],
      ],
      state2: [
        [3, { touch: 3, vac: 4, finger: 9 }],
        [4, { touch: 4, vac: 6 }],
      ],
    };

    const expectedOutput = {
      touch: {
        values: [1, 2, 3, 4],
        states: ["state1", "state1", "state2", "state2"],
        timestamps: [0, 1, 2, 3],
        ts_interval: [
          { state: "state1", x0: 0, diff: 1, x1: 2, max: 4, min: 1 },
          { state: "state2", x0: 2, diff: 1, x1: 3, max: 4, min: 1 },
        ],
      },
      vacuum: {
        values: [0, 2, 4, 6],
        states: ["state1", "state1", "state2", "state2"],
        timestamps: [0, 1, 2, 3],
        ts_interval: [
          { state: "state1", x0: 0, diff: 1, x1: 2, max: 6, min: 0 },
          { state: "state2", x0: 2, diff: 1, x1: 3, max: 6, min: 0 },
        ],
      },
      finger: {
        values: [6, 9],
        states: ["state1", "state2"],
        timestamps: [0, 1],
        ts_interval: [
          { state: "state1", x0: 0, diff: 0, x1: 1, max: 9, min: 6 },
          { state: "state2", x0: 1, diff: 0, x1: 1, max: 9, min: 6 },
        ],
      },
    };

    expect(transformSensors(sensorDataWithMissingProps)).toMatchObject(
      expectedOutput
    );
  });
});

test("should return the title case of str", () => {
  expect(titleCase("hds autodiagnostic")).toBe("Hds Autodiagnostic");
});

test("should reduce and return xlabels & ydata arrays", () => {
  const data = [
    {
      value: "AFTException",
      count: 2,
    },
    {
      value: "AFTBaseException",
      count: 5,
    },
  ];
  const expected = {
    xlabels: ["AFTBaseException", "AFTException"],
    ydata: [5, 2],
  };
  expect(sortReduceParetos(data)).toMatchObject(expected);
});
