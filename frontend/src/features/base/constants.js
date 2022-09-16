const API_PORT = process.env.REACT_APP_HDS_PORT || 8085;
const API_VERSION = "v1";

export const API_BASE_URL =
  process.env.REACT_APP_HDS_API_URL || `http://localhost:${API_PORT}`;
export const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;
export const CSRF_URL = `${API_URL}/users/csrf/`;
export const MAX_LIMIT = 10000;
export const PROD_ENV = "production";
