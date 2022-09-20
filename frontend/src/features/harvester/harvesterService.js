import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

const HARVESTERS_URL = `${API_URL}/harvesters/`;

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

const harvesterService = {
  listHarvesters,
  getHarvesterById,
  createHarvester,
  updateHarvester,
  paginateHarvester,
};

export default harvesterService;
