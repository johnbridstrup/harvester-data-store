import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

export const S3FILE_URL = `${API_URL}/s3files/`;

const queryS3File = async (queryObj, token) => {
  const params = new URLSearchParams(queryObj);
  const response = await axiosService.get(
    `${S3FILE_URL}?${params.toString()}`,
    token
  );
  return response;
};

const getS3FileById = async (fileId, token) => {
  const response = await axiosService.get(`${S3FILE_URL}${fileId}/`, token);
  return response;
};

const paginateS3File = async (url, token) => {
  const response = await axiosService.get(url, token);
  return response;
};

const s3fileService = {
  queryS3File,
  getS3FileById,
  paginateS3File,
};

export default s3fileService;
