import axios from "axios";
import { getCsrfToken } from "../../utils/utils";
import { LOGIN_URL, LOGOUT_URL } from './constants';


const login = async (userData) => {
  const config = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': await getCsrfToken()
    },
    credentials: 'include',
  }
  const response = await axios.post(LOGIN_URL, userData, config)
  if (response.data.data.data) {
    sessionStorage.setItem('user', JSON.stringify(response.data.data.data.user))
    sessionStorage.setItem('token', JSON.stringify(response.data.data.data.token))
    sessionStorage.setItem('isAuthenticated', JSON.stringify(true))
  }
  return response.data.data
}


const logout = async (tokenData) => {
  const config = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': await getCsrfToken()
    },
    credentials: 'include',
  }
  const response = await axios.post(LOGOUT_URL, tokenData, config)
  if (response.data.status === "success") {
    sessionStorage.removeItem("user")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("isAuthenticated")
  }
  return response.data
}

const authService = {
  login,
  logout
}
export default authService;