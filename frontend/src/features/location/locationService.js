import axios from "axios";
import { LOCATION_URL } from './constants';


const listLocations = async (token) => {
  const config = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    credentials: 'include',
  }
  const response = await axios.get(LOCATION_URL, config);
  return response.data.data.results;
}


const getLocationById = async (locId, token) => {
  const config = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    credentials: 'include',
  }
  const response = await axios.get(`${LOCATION_URL}${locId}/`, config);
  return response.data.data;
}


const locationService = {
  listLocations,
  getLocationById
}

export default locationService;
