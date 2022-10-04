import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

const RELEASE_URL = `${API_URL}/release/`;

const listRelease = async (token, limit = 10) => {
  let response = await axiosService.get(`${RELEASE_URL}?limit=${limit}`, token);
  return response;
};

const getReleaseById = async (token, releaseId) => {
  let response = await axiosService.get(`${RELEASE_URL}${releaseId}/`, token);
  return response;
};

const paginateRelease = async (url, token) => {
  let response = await axiosService.get(url, token);
  return response;
};

const releaseService = {
  listRelease,
  getReleaseById,
  paginateRelease,
};

export default releaseService;
