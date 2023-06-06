import { NOTIFICATION_URL } from "features/notification/notificationService";
import { API_URL, ERRORREPORT_TRIGGER } from "../base/constants";
import { axiosService } from "../base/service";

export const ERROR_REPORT_URL = `${API_URL}/errorreports/`;
export const ERROR_PARETO_URL = `${API_URL}/exceptions/pareto/`;

const queryErrorReport = async (paramsObj, token) => {
  const searchParams = new URLSearchParams(paramsObj);
  const response = await axiosService.get(
    `${ERROR_REPORT_URL}?${searchParams.toString()}`,
    token
  );
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
    `${ERROR_PARETO_URL}?${searchParams.toString()}`,
    token
  );
  return response;
};

const createNotification = async (paramsObj, token) => {
  const recipients = paramsObj["recipients"];
  delete paramsObj["recipients"];
  const searchParams = new URLSearchParams(paramsObj);
  const response = await axiosService.post(
    `${NOTIFICATION_URL}?${searchParams.toString()}`,
    token,
    { recipients, trigger_on: ERRORREPORT_TRIGGER }
  );
  return response;
};

const errorreportService = {
  queryErrorReport,
  detailErrorReport,
  generatePareto,
  createNotification,
};

export default errorreportService;
