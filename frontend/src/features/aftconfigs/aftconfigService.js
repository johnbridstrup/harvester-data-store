import { axiosService } from "../base/service";
import { HARVESTERS_URL } from "../harvester/harvesterService";

const fullConfigReport = async (id, token) => {
  let response = await axiosService.get(
    `${HARVESTERS_URL}${id}/config/`,
    token
  );
  return response;
};

const aftconfigService = {
  fullConfigReport,
};

export default aftconfigService;
