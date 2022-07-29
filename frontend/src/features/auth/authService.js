import { LOGIN_URL, LOGOUT_URL } from "../base/constants";
import { axiosService } from "../base/service";


const login = async (userData) => {
  const res = await axiosService.post(LOGIN_URL, undefined, userData);
  if (res.data.data) {
    sessionStorage.setItem('user', JSON.stringify(res.data.data.user))
    sessionStorage.setItem('token', JSON.stringify(res.data.data.token))
    sessionStorage.setItem('isAuthenticated', JSON.stringify(true))
  }
  return res;
}


const logout = async (tokenData) => {
  const response = await axiosService.post(LOGOUT_URL, undefined, tokenData);
  if (response.status === "success") {
    sessionStorage.removeItem("user")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("isAuthenticated")
  }
  return response
}

const authService = {
  login,
  logout
}
export default authService;