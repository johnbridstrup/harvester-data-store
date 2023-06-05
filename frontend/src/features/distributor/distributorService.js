import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

export const DISTRIBUTORS_URL = `${API_URL}/distributors/`;

const listDistributors = async (token, limit = 10) => {
  let response = await axiosService.get(
    `${DISTRIBUTORS_URL}?limit=${limit}`,
    token
  );
  return response;
};

const getDistributorById = async (distId, token) => {
  let response = await axiosService.get(`${DISTRIBUTORS_URL}${distId}/`, token);
  return response;
};

const createDistributor = async (data, token) => {
  let response = await axiosService.post(DISTRIBUTORS_URL, token, data);
  return response;
};

const updateDistributor = async (data, token) => {
  let response = await axiosService.patch(
    `${DISTRIBUTORS_URL}${data.objId}/`,
    token,
    data
  );
  return response;
};

const distributorService = {
  listDistributors,
  getDistributorById,
  createDistributor,
  updateDistributor,
};

export default distributorService;
