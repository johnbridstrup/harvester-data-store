import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

export const MIGRATION_URL = `${API_URL}/migrations/`;

const listMigrationLogs = async (token, queryObj = {}) => {
  if (!queryObj["limit"]) queryObj["limit"] = 10;
  const params = new URLSearchParams(queryObj);
  let response = await axiosService.get(
    `${MIGRATION_URL}?${params.toString()}`,
    token
  );
  return response;
};

const getMigrationLogById = async (id, token) => {
  const response = await axiosService.get(`${MIGRATION_URL}${id}/`, token);
  return response;
};

const execMigration = async (token) => {
  const response = await axiosService.get(`${MIGRATION_URL}migrate/`, token);
  return response;
};

const notificationService = {
  listMigrationLogs,
  getMigrationLogById,
  execMigration,
};

export default notificationService;
