/**
 * Defines the api action methods
 */

import { rest } from "msw";
import { LOGIN_URL } from "../features/auth/authService";
import { NOTIFICATION_URL } from "../features/notification/notificationService";
import { LOGSESSION_URL } from "../features/logparser/logparserService";

let genericListResponse = {
  status: "success",
  message: "any retrieved successfully",
  data: {
    count: 0,
    next: null,
    previous: null,
    results: [],
  },
};

let genericGetResponse = {
  status: "success",
  message: "any retrieved successfully",
  data: {},
};

export const login = rest.post(LOGIN_URL, (req, res, ctx) => {
  // Persist user's authentication in the localstorage
  let token = "435b18abedef452f64e7f4ed2e68e98ac8babf5e";
  let user = {
    id: 1,
    first_name: "",
    last_name: "",
    username: "aft",
    email: "aft@aft.aft",
    is_active: true,
    is_staff: true,
    is_superuser: true,
    last_login: "2022-12-16T14:04:17.044622Z",
    profile: {
      id: 1,
      slack_id: "slack@aft.aft",
      user: 1,
    },
  };
  localStorage.setItem("isAuthenticated", true);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);

  return res(
    // Respond with a 200 status code
    ctx.status(200)
  );
});

export const userNotification = rest.get(NOTIFICATION_URL, (req, res, ctx) => {
  genericListResponse["message"] = "notification retrieved successfully";
  return res(ctx.json(genericListResponse));
});

export const logsession = rest.get(LOGSESSION_URL, (req, res, ctx) => {
  genericListResponse["message"] = "logsession retrieved successfully";
  genericListResponse["data"]["results"] = [
    {
      id: 1,
      created: "2022-12-16T12:24:17.459077Z",
      lastModified: "2022-12-16T12:24:17.623473Z",
      name: "sessclip",
      date_time: "2022-11-01T23:23:00Z",
      zip_file: "http://example.zip",
      creator: 1,
      modifiedBy: null,
      harv: null,
      logs: {
        harv_id: null,
        robots: [],
        services: [],
        videos: [],
      },
    },
  ];
  return res(ctx.json(genericListResponse));
});
