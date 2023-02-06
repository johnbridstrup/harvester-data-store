import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

export const LOGIN_URL = `${API_URL}/users/login/`;
export const LOGOUT_URL = `${API_URL}/users/logout/`;
export const USER_PROFILE_URL = `${API_URL}/users/profiles/`;
export const PASSWORD_URL = `${API_URL}/users/change/password/`;

const login = async (userData) => {
  const res = await axiosService.post(LOGIN_URL, undefined, userData);
  if (res.data.data) {
    localStorage.setItem("user", JSON.stringify(res.data.data.user));
    localStorage.setItem("token", JSON.stringify(res.data.data.token));
    localStorage.setItem("isAuthenticated", JSON.stringify(true));
  }
  return res;
};

const logout = async (tokenData) => {
  const response = await axiosService.post(LOGOUT_URL, undefined, tokenData);
  if (response.status === "success") {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
  }
  return response;
};

const update = async (userId, token, userData) => {
  const response = await axiosService.patch(
    `${USER_PROFILE_URL}${userId}/`,
    token,
    userData
  );
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response;
};

const changePassword = async (token, userData) => {
  const response = await axiosService.post(`${PASSWORD_URL}`, token, userData);
  return response;
};

const confirmPassword = async (userData) => {
  const res = await axiosService.post(LOGIN_URL, undefined, userData);
  return res;
};

const authListener = async (userId, token) => {
  const response = await axiosService.get(
    `${USER_PROFILE_URL}${userId}/`,
    token
  );
  return response;
};

const authService = {
  login,
  logout,
  update,
  changePassword,
  confirmPassword,
  authListener,
};
export default authService;
