import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

export const EVENTS_URL = `${API_URL}/events/`;
export const PICKSESSION_URL = `${API_URL}/picksessions/`;

const listEvents = async (token, limit = 10) => {
  let response = await axiosService.get(`${EVENTS_URL}?limit=${limit}`, token);
  return response;
};

const getEventById = async (eventId, token) => {
  let response = await axiosService.get(`${EVENTS_URL}${eventId}/`, token);
  return response;
};

const queryEvent = async (paramsObj, token) => {
  const searchParams = new URLSearchParams(paramsObj);
  const response = await axiosService.get(
    `${EVENTS_URL}?${searchParams.toString()}`,
    token
  );
  return response;
};

const getEventTags = async (token) => {
  let response = await axiosService.get(`${EVENTS_URL}tags/`, token);
  return response;
};

const queryPickSession = async (paramsObj, token) => {
  const searchParams = new URLSearchParams(paramsObj);
  const response = await axiosService.get(
    `${PICKSESSION_URL}?${searchParams.toString()}`,
    token
  );
  return response;
};

const getPickSessionById = async (id, token) => {
  let response = await axiosService.get(`${PICKSESSION_URL}${id}/`, token);
  return response;
};

const getPickSessionTags = async (token) => {
  let response = await axiosService.get(`${PICKSESSION_URL}tags/`, token);
  return response;
};

const eventService = {
  listEvents,
  getEventById,
  queryEvent,
  getEventTags,
  queryPickSession,
  getPickSessionById,
  getPickSessionTags,
};

export default eventService;
