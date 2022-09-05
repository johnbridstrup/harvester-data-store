import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

const USERS_URL = `${API_URL}/users/profiles/`;

const listUsers = async (token, limit = 10) => {
  let response = await axiosService.get(`${USERS_URL}?limit=${limit}`, token);
  return response.results;
};

const getUserById = async (userId, token) => {
  const response = await axiosService.get(`${USERS_URL}${userId}/`, token);
  return response;
};

const userService = {
  listUsers,
  getUserById,
};

export default userService;
