import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

export const EVENTS_URL = `${API_URL}/events/`;

const listEvents = async (token, limit = 10) => {
  let response = await axiosService.get(`${EVENTS_URL}?limit=${limit}`, token);
  return response;
};

const getEventById = async (eventId, token) => {
  let response = await axiosService.get(`${EVENTS_URL}${eventId}/`, token);
  return response;
};

const paginateEvent = async (url, token) => {
  let response = await axiosService.get(url, token);
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

const eventService = {
  listEvents,
  getEventById,
  paginateEvent,
  queryEvent,
  getEventTags,
};

export default eventService;
