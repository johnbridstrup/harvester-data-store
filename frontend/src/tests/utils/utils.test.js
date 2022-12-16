/**
 * Test utils methods in the utils.js file
 */

import { findClosest } from "../../utils/utils";

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
