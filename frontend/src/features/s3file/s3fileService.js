import { API_URL } from "../base/constants";
import { axiosService } from "../base/service";

const s3FileDownload = async (endpoint, token) => {
  const s3fileUrl = `${API_URL}${endpoint}`;
  const resp = await axiosService.get(s3fileUrl, token);
  return resp.data;
};

const s3FileService = {
  s3FileDownload,
};

export default s3FileService;
