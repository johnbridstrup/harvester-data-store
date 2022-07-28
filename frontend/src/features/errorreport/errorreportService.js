import axios from 'axios';
import { ERROR_REPORT_URL } from './constants';


const errorListView = async (token) => {
  const config = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    credentials: 'include',
  }

  const response = await axios.get(`${ERROR_REPORT_URL}`, config);
  return response.data.data;
}


const queryErrorReport = async (paramsObj, token) => {
  const config = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    credentials: 'include',
  }
  const searchParams = new URLSearchParams(paramsObj)
  const response = await axios.get(`${ERROR_REPORT_URL}?${searchParams.toString()}`, config);
  return response.data.data;
}


const paginateErrorReport = async (url, token) => {
  const config = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    credentials: 'include',
  }
  const response = await axios.get(url, config);
  return response.data.data;
}


const errorreportService = {
  errorListView,
  queryErrorReport,
  paginateErrorReport
}

export default errorreportService;