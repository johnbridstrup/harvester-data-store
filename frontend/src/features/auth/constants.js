const HDS_PORT = process.env.REACT_APP_HDS_PORT || 8085;
const API_BASE_URL = `http://localhost:${HDS_PORT}/api/v1/users`;

export const LOGIN_URL = `${API_BASE_URL}/login/`;
export const LOGOUT_URL = `${API_BASE_URL}/logout/`;