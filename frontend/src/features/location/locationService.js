import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

const LOCATION_URL = `${API_URL}/locations/`;

const listLocations = async (token, limit = 10) => {
  let response = await axiosService.get(
    `${LOCATION_URL}?limit=${limit}`,
    token
  );
  return response.results;
};

const getLocationById = async (locId, token) => {
  const response = await axiosService.get(`${LOCATION_URL}${locId}/`, token);
  return response;
};

const createLocation = async (data, token) => {
  let response = await axiosService.post(LOCATION_URL, token, data);
  return response;
};

const updateLocation = async (data, token) => {
  let response = await axiosService.patch(
    `${LOCATION_URL}${data.objId}/`,
    token,
    data
  );
  return response;
};

const locationService = {
  listLocations,
  getLocationById,
  createLocation,
  updateLocation,
};

export default locationService;
