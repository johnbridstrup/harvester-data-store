import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

const CODE_URL = `${API_URL}/exceptioncodes/`;

const listCodes = async (token, limit = 10) => {
  let response = await axiosService.get(`${CODE_URL}?limit=${limit}`, token);
  return response.results;
};

const getCodeById = async (token, codeId) => {
  let response = await axiosService.get(`${CODE_URL}${codeId}/`, token);
  return response;
};

const codeService = {
  listCodes,
  getCodeById,
};

export default codeService;
