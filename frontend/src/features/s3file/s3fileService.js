import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

const s3FileDownload = (endpoint, token) => {
  const s3fileUrl = `${API_URL}${endpoint}`;
  return axiosService.download(s3fileUrl, token);
};

const s3FileService = {
  s3FileDownload,
};

export default s3FileService;
