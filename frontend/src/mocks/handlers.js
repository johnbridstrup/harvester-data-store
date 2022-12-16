/**
 * Defines the mock handlers for api requests
 */

import { login, logsession, userNotification } from "./actions";

export const handlers = [login, userNotification, logsession];
