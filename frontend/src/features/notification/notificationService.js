import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

const NOTIFICATION_URL = `${API_URL}/notifications/`;

const listNotifications = async (token, limit = 10) => {
  let response = await axiosService.get(
    `${NOTIFICATION_URL}?limit=${limit}`,
    token
  );
  return response.results;
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

const notificationService = {
  listNotifications,
  getNotificationById,
  deleteNotification,
};

export default notificationService;
