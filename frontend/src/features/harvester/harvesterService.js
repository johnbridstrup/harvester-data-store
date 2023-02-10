import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

export const HARVESTERS_URL = `${API_URL}/harvesters/`;
export const HARVESTER_HISTORY_URL = `${API_URL}/harvesterhistory/`;

const listHarvesters = async (token, limit = 10) => {
  let response = await axiosService.get(
    `${HARVESTERS_URL}?limit=${limit}`,
    token
  );
  return response;
};

const getHarvesterById = async (harvId, token) => {
  let response = await axiosService.get(`${HARVESTERS_URL}${harvId}/`, token);
  return response;
};

const createHarvester = async (data, token) => {
  let response = await axiosService.post(HARVESTERS_URL, token, data);
  return response;
};

const updateHarvester = async (data, token) => {
  let response = await axiosService.patch(
    `${HARVESTERS_URL}${data.objId}/`,
    token,
    data
  );
  return response;
};

const paginateHarvester = async (url, token) => {
  const response = await axiosService.get(url, token);
  return response;
};

const queryHarvester = async (queryObj, token) => {
  const params = new URLSearchParams(queryObj);
  const response = await axiosService.get(
    `${HARVESTERS_URL}?${params.toString()}`,
    token
  );
  return response;
};

const listHarvVersion = async (harvId, token, limit = 10) => {
  let response = await axiosService.get(
    `${HARVESTERS_URL}${harvId}/versions/?limit=${limit}`,
    token
  );
  return response;
};

const listHarvesterHistory = async (token, limit = 10) => {
  let response = await axiosService.get(
    `${HARVESTER_HISTORY_URL}?limit=${limit}`,
    token
  );
  return response;
};

const getHarvHistoryById = async (harvId, token) => {
  let response = await axiosService.get(
    `${HARVESTER_HISTORY_URL}${harvId}/`,
    token
  );
  return response;
};

const paginateHarvHistory = async (url, token) => {
  const response = await axiosService.get(url, token);
  return response;
};

const queryHarvHistory = async (queryObj, token) => {
  const params = new URLSearchParams(queryObj);
  const response = await axiosService.get(
    `${HARVESTER_HISTORY_URL}?${params.toString()}`,
    token
  );
  return response;
};

const harvesterService = {
  listHarvesters,
  getHarvesterById,
  createHarvester,
  updateHarvester,
  paginateHarvester,
  queryHarvester,
  listHarvVersion,
  listHarvesterHistory,
  getHarvHistoryById,
  paginateHarvHistory,
  queryHarvHistory,
};

export default harvesterService;
