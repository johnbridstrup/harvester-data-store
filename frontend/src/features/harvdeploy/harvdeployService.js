import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

const RELEASE_URL = `${API_URL}/release/`;
const HARVVERSION_URL = `${API_URL}/harvversion/`;

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

const listVersion = async (token, limit = 10) => {
  let response = await axiosService.get(
    `${HARVVERSION_URL}?limit=${limit}`,
    token
  );
  return response;
};

const getVersionById = async (token, versionId) => {
  let response = await axiosService.get(
    `${HARVVERSION_URL}${versionId}/`,
    token
  );
  return response;
};

const paginateVersion = async (url, token) => {
  let response = await axiosService.get(url, token);
  return response;
};

const harvdeployService = {
  listRelease,
  getReleaseById,
  paginateRelease,
  listVersion,
  getVersionById,
  paginateVersion,
};

export default harvdeployService;
