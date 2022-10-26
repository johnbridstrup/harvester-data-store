import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

const JOBTYPES_URL = `${API_URL}/jobtypes/`;
const JOBSCHEMAS_URL = `${API_URL}/jobschemas/`;

const listJobTypes = async (token, limit = 10) => {
  let response = await axiosService.get(
    `${JOBTYPES_URL}?limit=${limit}`,
    token
  );
  return response;
};

const getJobTypeById = async (jobtypeId, token) => {
  let response = await axiosService.get(`${JOBTYPES_URL}${jobtypeId}/`, token);
  return response;
};

const createJobType = async (data, token) => {
  let response = await axiosService.post(JOBTYPES_URL, token, data);
  return response;
};

const updateJobType = async (data, token) => {
  let response = await axiosService.patch(
    `${JOBTYPES_URL}${data.objId}/`,
    token,
    data
  );
  return response;
};

const paginateJob = async (url, token) => {
  const response = await axiosService.get(url, token);
  return response;
};

const listJobSchemas = async (token, limit = 10) => {
  let response = await axiosService.get(
    `${JOBSCHEMAS_URL}?limit=${limit}`,
    token
  );
  return response;
};

const getJobSchemaById = async (id, token) => {
  let response = await axiosService.get(`${JOBSCHEMAS_URL}${id}/`, token);
  return response;
};

const createJobSchema = async (data, token) => {
  let response = await axiosService.post(JOBSCHEMAS_URL, token, data);
  return response;
};

const updateJobSchema = async (data, token) => {
  let response = await axiosService.patch(
    `${JOBSCHEMAS_URL}${data.objId}/`,
    token,
    data
  );
  return response;
};

const queryJobSchema = async (queryObj, token) => {
  let params = new URLSearchParams(queryObj);
  let response = await axiosService.get(
    `${JOBSCHEMAS_URL}?${params.toString()}`,
    token
  );
  return response;
};

const harvjobService = {
  listJobTypes,
  getJobTypeById,
  createJobType,
  updateJobType,
  paginateJob,
  listJobSchemas,
  getJobSchemaById,
  createJobSchema,
  updateJobSchema,
  queryJobSchema,
};

export default harvjobService;
