import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

const EVENTS_URL = `${API_URL}/events/`;

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

const eventService = {
  listEvents,
  getEventById,
  paginateEvent,
};

export default eventService;
