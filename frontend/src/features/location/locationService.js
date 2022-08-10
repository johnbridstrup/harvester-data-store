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

const locationService = {
  listLocations,
  getLocationById,
};

export default locationService;
