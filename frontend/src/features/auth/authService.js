import { API_BASE_URL } from "../base/constants";
import { axiosService } from "../base/service";

const LOGIN_URL = `${API_BASE_URL}/users/login/`;
const LOGOUT_URL = `${API_BASE_URL}/users/logout/`;


const login = async (userData) => {
  const res = await axiosService.post(LOGIN_URL, undefined, userData);
  if (res.data.data) {
    localStorage.setItem('user', JSON.stringify(res.data.data.user))
    localStorage.setItem('token', JSON.stringify(res.data.data.token))
    localStorage.setItem('isAuthenticated', JSON.stringify(true))
  }
  return res;
}


const logout = async (tokenData) => {
  const response = await axiosService.post(LOGOUT_URL, undefined, tokenData);
  if (response.status === "success") {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("isAuthenticated")
  }
  return response
}

const authService = {
  login,
  logout
}
export default authService;