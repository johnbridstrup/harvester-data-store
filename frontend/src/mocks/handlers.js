/**
 * Defines the mock handlers for api requests
 */

import { login, logsession, userNotification, listMigrations } from "./actions";

export const handlers = [login, userNotification, logsession, listMigrations];
