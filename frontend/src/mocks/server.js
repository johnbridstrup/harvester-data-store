/**
 * Defines the request mocking server for the request handlers.
 */

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
