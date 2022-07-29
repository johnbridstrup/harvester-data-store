import { ERROR_REPORT_URL } from "../base/constants";
import { axiosService } from "../base/service";


const errorListView = async (token) => {
  let response = await axiosService.get(ERROR_REPORT_URL, token);
  return response;
}


const queryErrorReport = async (paramsObj, token) => {
  const searchParams = new URLSearchParams(paramsObj)
  const response = await axiosService.get(`${ERROR_REPORT_URL}?${searchParams.toString()}`, token)
  return response;
}


const paginateErrorReport = async (url, token) => {
  const response = await axiosService.get(url, token);
  return response;
}


const errorreportService = {
  errorListView,
  queryErrorReport,
  paginateErrorReport
}

export default errorreportService;