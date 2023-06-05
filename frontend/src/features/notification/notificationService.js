import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

export const NOTIFICATION_URL = `${API_URL}/notifications/`;

const listNotifications = async (token, limit = 10) => {
  let response = await axiosService.get(
    `${NOTIFICATION_URL}?limit=${limit}`,
    token
  );
  return response;
};

const getNotificationById = async (notifyId, token) => {
  const response = await axiosService.get(
    `${NOTIFICATION_URL}${notifyId}/`,
    token
  );
  return response;
};

const deleteNotification = async (notifyId, token) => {
  const response = await axiosService.delete(
    `${NOTIFICATION_URL}${notifyId}/`,
    token
  );
  return response;
};

const queryNotification = async (queryObj, token) => {
  const params = new URLSearchParams(queryObj);
  const response = await axiosService.get(
    `${NOTIFICATION_URL}?${params.toString()}`,
    token
  );
  return response;
};

const notificationService = {
  listNotifications,
  getNotificationById,
  deleteNotification,
  queryNotification,
};

export default notificationService;
