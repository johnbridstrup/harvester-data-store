import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

const FRUIT_URL = `${API_URL}/fruit/`;

const listFruits = async (token, limit = 10) => {
  let response = await axiosService.get(`${FRUIT_URL}?limit=${limit}`, token);
  return response;
};

const getFruitById = async (token, fruitId) => {
  let response = await axiosService.get(`${FRUIT_URL}${fruitId}/`, token);
  return response;
};

const fruitService = {
  listFruits,
  getFruitById,
};

export default fruitService;
