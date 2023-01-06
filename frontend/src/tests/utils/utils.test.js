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
} from "utils/utils";

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
