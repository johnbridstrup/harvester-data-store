import { LOCATION_URL } from "../base/constants";
import { axiosService } from "../base/service";


const listLocations = async (token) => {
  let response = await axiosService.get(LOCATION_URL, token);
  return response.results;
}


const getLocationById = async (locId, token) => {
  const response = await axiosService.get(`${LOCATION_URL}${locId}/`, token);
  return response;
}


const locationService = {
  listLocations,
  getLocationById
}

export default locationService;
