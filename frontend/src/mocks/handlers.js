/**
 * Defines the mock handlers for api requests
 */

import {
  login,
  logsession,
  userNotification,
  listMigrations,
  listS3Files,
  getS3File,
  eventTags,
  getMigration,
  getHarvester,
  listErrorReport,
} from "./actions";

export const handlers = [
  login,
  userNotification,
  logsession,
  listMigrations,
  getMigration,
  listS3Files,
  getS3File,
  eventTags,
  getHarvester,
  listErrorReport,
];
