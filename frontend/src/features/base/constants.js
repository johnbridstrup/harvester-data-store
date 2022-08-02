const API_PORT = process.env.REACT_APP_HDS_PORT || 8085;
const API_VERSION = "v1";
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost";

export const API_BASE_URL = `${BASE_URL}:${API_PORT}/api/${API_VERSION}`

export const CSRF_URL = `${API_BASE_URL}/users/csrf/`;