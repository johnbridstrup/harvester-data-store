import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

export const LOGSESSION_URL = `${API_URL}/logsessions/`;
export const LOGFILES_URL = `${API_URL}/logfiles/`;
export const LOGVIDEOS_URL = `${API_URL}/logvideos/`;

const listLogSession = async (token, queryObj = {}) => {
  if (!queryObj["limit"]) queryObj["limit"] = 10;
  let params = new URLSearchParams(queryObj);
  let response = await axiosService.get(
    `${LOGSESSION_URL}?${params.toString()}`,
    token
  );
  return response;
};

const getLogSessionById = async (id, token) => {
  let response = await axiosService.get(`${LOGSESSION_URL}${id}/`, token);
  return response;
};

const createLogSession = async (token, data = {}) => {
  let response = await axiosService.upload(LOGSESSION_URL, token, data);
  return response;
};

const paginateLog = async (url, token) => {
  const response = await axiosService.get(url, token);
  return response;
};

const getLogFileById = async (id, token) => {
  let response = await axiosService.get(`${LOGFILES_URL}${id}/`, token);
  return response;
};

const queryLogVideo = async (token, queryObj = {}) => {
  let params = new URLSearchParams(queryObj);
  let response = await axiosService.get(
    `${LOGVIDEOS_URL}?${params.toString()}`,
    token
  );
  return response;
};

const logparserService = {
  listLogSession,
  getLogSessionById,
  createLogSession,
  paginateLog,
  getLogFileById,
  queryLogVideo,
};

export default logparserService;
