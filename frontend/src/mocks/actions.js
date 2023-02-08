/**
 * Defines the api action methods
 */

import { rest } from "msw";
import { LOGIN_URL } from "features/auth/authService";
import { NOTIFICATION_URL } from "features/notification/notificationService";
import { LOGSESSION_URL } from "features/logparser/logparserService";
import { MIGRATION_URL } from "features/migration/migrationService";
import { S3FILE_URL } from "features/s3file/s3fileService";
import { EVENTS_URL } from "features/event/eventService";

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

export const listMigrations = rest.get(MIGRATION_URL, (req, res, ctx) => {
  genericListResponse["message"] = "hdsmigrations retrieved successfully";
  genericListResponse["data"]["results"] = [
    {
      id: 1,
      created: "2022-12-21T15:08:55.287624Z",
      lastModified: "2022-12-21T15:08:56.092803Z",
      result: "success",
      startTime: "2022-12-21T15:08:55.327949Z",
      endTime: "2022-12-21T15:08:56.092396Z",
      output:
        "Operations to perform:\n  Apply all migrations: admin, auth, authtoken, common, contenttypes, django_celery_results, errorreport, event, exceptions, harvdeploy, harvester, harvjobs, hdsmigrations, location, logparser, notifications, s3file, sessions, taggit\nRunning migrations:\n  No migrations to apply.\n",
      githash: '"UNKNOWN"',
      creator: 1,
      modifiedBy: null,
    },
  ];
  return res(ctx.json(genericListResponse));
});

export const listS3Files = rest.get(S3FILE_URL, (req, res, ctx) => {
  genericListResponse["message"] = "s3file retrieved successfully";
  genericListResponse["data"]["results"] = [
    {
      id: 1,
      created: "2022-08-26T22:29:25.915000Z",
      lastModified: "2023-02-07T12:45:26.388466Z",
      file: "http://localhost:8085/media/fake",
      filetype: "fake",
      key: "fake",
      creator: 1,
      modifiedBy: null,
      event: {
        id: 3,
        tags: [],
        created: "2022-08-25T22:58:43.804000Z",
        lastModified: "2022-08-25T22:58:43.804000Z",
        UUID: "77f6a03c-24c9-11ed-bb17-f9799c718175",
        creator: 1,
        modifiedBy: null,
        related_objects: [
          {
            url: "/errorreports/3/",
            object: "Error Report",
          },
        ],
        related_files: [
          {
            url: null,
            filetype: "fake",
          },
        ],
      },
    },
  ];

  return res(ctx.json(genericListResponse));
});

export const getS3File = rest.get(`${S3FILE_URL}:s3fileId`, (req, res, ctx) => {
  genericGetResponse["message"] = "s3file retrieved successfully";
  genericGetResponse["data"] = {
    id: 1,
    created: "2022-08-26T22:29:25.915000Z",
    lastModified: "2023-02-07T12:45:26.388466Z",
    file: "http://localhost:8085/media/fake",
    filetype: "fake",
    key: "fake",
    creator: 1,
    modifiedBy: null,
    event: {
      id: 3,
      tags: [],
      created: "2022-08-25T22:58:43.804000Z",
      lastModified: "2022-08-25T22:58:43.804000Z",
      UUID: "77f6a03c-24c9-11ed-bb17-f9799c718175",
      creator: 1,
      modifiedBy: null,
      related_objects: [
        {
          url: "/errorreports/3/",
          object: "Error Report",
        },
      ],
      related_files: [
        {
          url: null,
          filetype: "fake",
        },
      ],
    },
  };
  return res(ctx.json(genericGetResponse));
});

export const eventTags = rest.get(`${EVENTS_URL}tags`, (req, res, ctx) => {
  genericGetResponse["message"] = "Event tags";
  genericGetResponse["data"] = {
    tags: ["Incomplete", "Invalid", "Unset"],
  };
  return res(ctx.json(genericGetResponse));
});
