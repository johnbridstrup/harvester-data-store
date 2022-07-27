import axios from "axios";
import { HARVESTERS_URL } from './constants';


const listHarvesters = async (token) => {
  const config = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    credentials: 'include',
  }
  const response = await axios.get(HARVESTERS_URL, config);
  return response.data.data.results;
}


const getHarvesterById = async (harvId, token) => {
  const config = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    credentials: 'include',
  }
  const response = await axios.get(`${HARVESTERS_URL}${harvId}/`, config);
  return response.data.data;
}


const harvesterService = {
  listHarvesters,
  getHarvesterById
}

export default harvesterService;
