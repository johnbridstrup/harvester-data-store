import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

export const SCHEDULEDJOBS_URL = `${API_URL}/scheduledjobs/`;

const queryScheduledJobs = async (queryObj, token) => {
  let params = new URLSearchParams(queryObj);
  let response = await axiosService.get(
    `${SCHEDULEDJOBS_URL}?${params.toString()}`,
    token
  );
  return response;
};

const getScheduledJobById = async (id, token) => {
  let response = await axiosService.get(`${SCHEDULEDJOBS_URL}${id}/`, token);
  return response;
};

const getJobTypeSchema = async (token) => {
  let response = await axiosService.get(`${SCHEDULEDJOBS_URL}create/`, token);
  return response;
};

const getScheduledJobForm = async (url, token) => {
  let response = await axiosService.get(url, token);
  return response;
};

const createScheduledJob = async (url, token, data = {}) => {
  let response = await axiosService.post(url, token, data);
  return response;
};

const paginateScheduledJob = async (url, token) => {
  const response = await axiosService.get(url, token);
  return response;
};

const jobschedulerService = {
  queryScheduledJobs,
  getScheduledJobById,
  getJobTypeSchema,
  getScheduledJobForm,
  createScheduledJob,
  paginateScheduledJob,
};

export default jobschedulerService;
