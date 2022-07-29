import { HARVESTERS_URL } from "../base/constants";
import { axiosService } from "../base/service";


const listHarvesters = async (token) => {
  let response = await axiosService.get(HARVESTERS_URL, token);
  return response.results;
}


const getHarvesterById = async (harvId, token) => {
  let response = await axiosService.get(`${HARVESTERS_URL}${harvId}/`, token)
  return response;
}


const harvesterService = {
  listHarvesters,
  getHarvesterById
}

export default harvesterService;
