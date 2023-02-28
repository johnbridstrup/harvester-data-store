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
import { HARVESTERS_URL } from "features/harvester/harvesterService";
import { ERROR_REPORT_URL } from "features/errorreport/errorreportService";
import errorreport from "test-utils/test-data/errorreport.json";
import { AUTODIAG_REPORT_URL } from "features/autodiagnostics/autodiagnosticService";
import autodiagnostic from "test-utils/test-data/autodiagnostic.json";
import harvester from "test-utils/test-data/harvester.json";
import { LOCATION_URL } from "features/location/locationService";
import location from "test-utils/test-data/location.json";
import s3file from "test-utils/test-data/s3file.json";
import migrationlog from "test-utils/test-data/migration.json";

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
  genericListResponse["data"]["results"] = [migrationlog];
  return res(ctx.json(genericListResponse));
});

export const getMigration = rest.get(
  `${MIGRATION_URL}:migrationId`,
  (req, res, ctx) => {
    genericGetResponse["message"] = "migration retrieved successfully";
    genericGetResponse["data"] = migrationlog;
    return res(ctx.json(genericGetResponse));
  }
);

export const listS3Files = rest.get(S3FILE_URL, (req, res, ctx) => {
  genericListResponse["message"] = "s3file retrieved successfully";
  genericListResponse["data"]["results"] = [s3file];

  return res(ctx.json(genericListResponse));
});

export const getS3File = rest.get(`${S3FILE_URL}:s3fileId`, (req, res, ctx) => {
  genericGetResponse["message"] = "s3file retrieved successfully";
  genericGetResponse["data"] = s3file;
  return res(ctx.json(genericGetResponse));
});

export const eventTags = rest.get(`${EVENTS_URL}tags`, (req, res, ctx) => {
  genericGetResponse["message"] = "Event tags";
  genericGetResponse["data"] = {
    tags: ["Incomplete", "Invalid", "Unset"],
  };
  return res(ctx.json(genericGetResponse));
});

export const getHarvester = rest.get(
  `${HARVESTERS_URL}:harvId`,
  (req, res, ctx) => {
    genericGetResponse["message"] = "harvester retrieved successfully";
    genericGetResponse["data"] = harvester;
    return res(ctx.json(genericGetResponse));
  }
);

export const listErrorReport = rest.get(ERROR_REPORT_URL, (req, res, ctx) => {
  genericListResponse["message"] = "errorreport retrieved successfully";
  genericListResponse["data"]["results"] = [errorreport];
  return res(ctx.json(genericListResponse));
});

export const getErrorReport = rest.get(
  `${ERROR_REPORT_URL}:reportId`,
  (req, res, ctx) => {
    genericGetResponse["message"] = "errorreport retrieved successfully";
    genericGetResponse["data"] = errorreport;
    return res(ctx.json(genericGetResponse));
  }
);

export const listAutodiagReport = rest.get(
  AUTODIAG_REPORT_URL,
  (req, res, ctx) => {
    genericListResponse["message"] = "autodiagnostics retrieved successfully";
    genericListResponse["data"]["results"] = [autodiagnostic];
    return res(ctx.json(genericListResponse));
  }
);

export const listHarvesters = rest.get(HARVESTERS_URL, (req, res, ctx) => {
  genericListResponse["message"] = "harvesters retrieved successfully";
  genericListResponse["data"]["results"] = [harvester];
  return res(ctx.json(genericListResponse));
});

export const listLocations = rest.get(LOCATION_URL, (req, res, ctx) => {
  genericListResponse["message"] = "locations retrieved successfully";
  genericListResponse["data"]["results"] = [location];
  return res(ctx.json(genericListResponse));
});

export const getAutodiagReport = rest.get(
  `${AUTODIAG_REPORT_URL}:reportId`,
  (req, res, ctx) => {
    genericGetResponse["message"] = "autodiagnostics retrieved successfully";
    genericGetResponse["data"] = autodiagnostic;
    return res(ctx.json(genericGetResponse));
  }
);
