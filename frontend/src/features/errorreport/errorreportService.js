import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

export const ERROR_REPORT_URL = `${API_URL}/errorreports/`;

const errorListView = async (token) => {
  let response = await axiosService.get(ERROR_REPORT_URL, token);
  return response;
};

const queryErrorReport = async (paramsObj, token) => {
  const searchParams = new URLSearchParams(paramsObj);
  const response = await axiosService.get(
    `${ERROR_REPORT_URL}?${searchParams.toString()}`,
    token
  );
  return response;
};

const paginateErrorReport = async (url, token) => {
  const response = await axiosService.get(url, token);
  return response;
};

const detailErrorReport = async (reportId, token) => {
  const response = await axiosService.get(
    `${ERROR_REPORT_URL}${reportId}`,
    token
  );
  return response;
};

const generatePareto = async (paramsObj, token) => {
  const searchParams = new URLSearchParams(paramsObj);
  const response = await axiosService.get(
    `${ERROR_REPORT_URL}pareto/?${searchParams.toString()}`,
    token
  );
  return response;
};

const createNotification = async (paramsObj, token) => {
  const recipients = paramsObj["recipients"];
  delete paramsObj["recipients"];
  const searchParams = new URLSearchParams(paramsObj);
  const response = await axiosService.post(
    `${ERROR_REPORT_URL}createnotification/?${searchParams.toString()}`,
    token,
    { recipients }
  );
  return response;
};

const errorreportService = {
  errorListView,
  queryErrorReport,
  paginateErrorReport,
  detailErrorReport,
  generatePareto,
  createNotification,
};

export default errorreportService;
