import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

export const USERS_URL = `${API_URL}/users/profiles/`;

const listUsers = async (token, limit = 10) => {
  let response = await axiosService.get(`${USERS_URL}?limit=${limit}`, token);
  return response;
};

const getUserById = async (userId, token) => {
  const response = await axiosService.get(`${USERS_URL}${userId}/`, token);
  return response;
};

const createUser = async (userData, token) => {
  const response = await axiosService.post(USERS_URL, token, userData);
  return response;
};

const paginateUser = async (url, token) => {
  const response = await axiosService.get(url, token);
  return response;
};

const updateUser = async (userData, token) => {
  const response = await axiosService.patch(
    `${USERS_URL}${userData.objId}/`,
    token,
    userData
  );
  return response;
};

const userService = {
  listUsers,
  getUserById,
  createUser,
  paginateUser,
  updateUser,
};

export default userService;
