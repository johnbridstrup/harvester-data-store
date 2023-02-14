import { axiosService } from "../base/service";
import { API_URL } from "../base/constants";

export const AUTODIAG_REPORT_URL = `${API_URL}/autodiagnostics/`;

const queryAutodiagReport = async (paramsObj, token) => {
  const searchParams = new URLSearchParams(paramsObj);
  const response = await axiosService.get(
    `${AUTODIAG_REPORT_URL}?${searchParams.toString()}`,
    token
  );
  return response;
};

const getAutodiagReport = async (id, token) => {
  const response = await axiosService.get(`${AUTODIAG_REPORT_URL}${id}`, token);
  return response;
};

const paginateAutodiagReport = async (url, token) => {
  const response = await axiosService.get(url, token);
  return response;
};

const autodiagnosticService = {
  queryAutodiagReport,
  getAutodiagReport,
  paginateAutodiagReport,
};

export default autodiagnosticService;
