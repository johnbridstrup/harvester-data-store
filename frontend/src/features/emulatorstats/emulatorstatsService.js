import { API_URL } from "features/base/constants";
import { axiosService } from "features/base/service";

export const EMULATORSTATS_URL = `${API_URL}/emustats/`;

const queryEmulatorstats = async (paramsObj, token) => {
  const searchParams = new URLSearchParams(paramsObj);
  const response = await axiosService.get(
    `${EMULATORSTATS_URL}?${searchParams.toString()}`,
    token
  );
  return response;
};

const getEmulatorstatsById = async (id, token) => {
  const response = await axiosService.get(`${EMULATORSTATS_URL}${id}`, token);
  return response;
};

const getEmulatorstatsTags = async (token) => {
  const response = await axiosService.get(`${EMULATORSTATS_URL}tags`, token);
  return response;
};

const emulatorstatsService = {
  queryEmulatorstats,
  getEmulatorstatsById,
  getEmulatorstatsTags,
};

export default emulatorstatsService;
