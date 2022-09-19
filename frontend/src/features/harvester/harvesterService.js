import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

const HARVESTERS_URL = `${API_URL}/harvesters/`;

const listHarvesters = async (token, limit = 10) => {
  let response = await axiosService.get(
    `${HARVESTERS_URL}?limit=${limit}`,
    token
  );
  return response.results;
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

const harvesterService = {
  listHarvesters,
  getHarvesterById,
  createHarvester,
  updateHarvester,
};

export default harvesterService;
