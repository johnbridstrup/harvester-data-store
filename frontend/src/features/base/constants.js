const API_PORT = process.env.REACT_APP_HDS_PORT || 8085;
const API_VERSION = "v1";

export const API_BASE_URL =
  process.env.REACT_APP_HDS_API_URL || `http://localhost:${API_PORT}`;
export const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;
export const CSRF_URL = `${API_URL}/users/csrf/`;
export const OPENAPI_URL = `${API_URL}/openapi?format=openapi-json`;
export const MAX_LIMIT = 10000;
export const PROD_ENV = "production";
export const SUCCESS = "success";
export const status = {
  HTTP_401_UNAUTHORIZED: "Request failed with status code 401",
  HTTP_403_FORBIDDED: "Request failed with status code 403",
};
export const NOTIFY_CATEGORY = {
  created: "created",
  isRecipient: "is_recipient",
};
export const FULLFILLED_PROMISE = {
  notification: "notification/deleteNotification/fulfilled",
  logout: "auth/logout/fulfilled",
  migration: "migration/execMigration/fulfilled",
  aftconfig: "aftconfig/fullConfigReport/fulfilled",
  s3file: "s3file/deleteS3File/fulfilled",
};

export const REJECTED_PROMISE = {
  notification: "notification/deleteNotification/rejected",
  password: "auth/changePassword/rejected",
  profile: "auth/updateProfile/rejected",
  confirm: "auth/confirmPassword/rejected",
  migration: "migration/execMigration/rejected",
  aftconfig: "aftconfig/fullConfigReport/rejected",
  s3file: "s3file/deleteS3File/rejected",
};

export const LOG_STR_PATTERN =
  /^\[([0-9]{8}T[0-9]{6}.[0-9]{3})\] \[([A-Z]+)\] \[([a-zA-Z0-9(_.\s)?]+)\]/;
export const LOG_MSG_PATTERN =
  /-- [A-Za-z0-9(:\s.,<>?_\t\n{}[\]/'"~`!@#$%^&*()-+=)?]+/i;

export const LOG_LEVEL = {
  DEBUG: "DEBUG",
  WARNING: "WARNING",
  ERROR: "ERROR",
  CRITICAL: "CRITICAL",
  INFO: "INFO",
};

export const THEME_MODES = {
  AUTO_THEME: "auto",
  LIGHT_THEME: "light",
  DARK_THEME: "dark",
};

export const MASTER_ROBOT = 0;

export class PushStateEnum {
  static get GENPARETO() {
    return "genpareto";
  }
  static get BUILDCHART() {
    return "buildchart";
  }
}
