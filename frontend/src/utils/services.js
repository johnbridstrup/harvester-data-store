import { toast } from "react-toastify";
import { SUCCESS } from "features/base/constants";
import harvjobService from "features/harvjobs/harvjobService";
import { createJob } from "features/harvjobs/harvjobSlice";
import errorreportService from "features/errorreport/errorreportService";
import { aggregateOptions, uuid } from "./utils";

export const handleDownload = async (fileObj, token) => {
  const link = document.createElement("a");
  link.href = fileObj.url;
  link.setAttribute("target", `_blank`);
  link.setAttribute("rel", "noopener");
  document.body.appendChild(link);
  link.click();
};

export const handleReleaseFormSubmit = (
  releaseObj,
  selectedHarvId,
  user,
  dispatch
) => {
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const data = {
      payload: {},
    };

    if (!user?.is_superuser) {
      toast.error("Permissions denied!");
      return;
    }

    if (selectedHarvId && selectedHarvId.hasOwnProperty("value")) {
      data["target"] = selectedHarvId.value;
    }
    let jobtype = "install_release";
    try {
      let res = await harvjobService.queryJobSchema({
        jobtype__name: jobtype,
        limit: 1,
      });
      data["schema_version"] = res.results[0]?.version;
      data["payload"]["run_state"] = ["updating"];
      data["payload"]["targets"] = ["master"];
      data["payload"]["release"] = releaseObj?.release;
      data["jobtype"] = jobtype;

      res = await dispatch(createJob(data));
      if (res.payload?.status === SUCCESS) {
        toast.success(res.payload?.message);
      } else {
        toast.error(res?.payload);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  return handleFormSubmit;
};

export const paretoApiService = async (
  groups,
  token,
  aggregateObj,
  setParetoArr,
  memoizeSortReducePareto
) => {
  const paretoObjs = await Promise.all(
    groups.map(async (group) => {
      const chart_title = aggregateOptions.find(
        (x) => x.value === group
      )?.label;

      try {
        const res = await errorreportService.generatePareto(
          { ...aggregateObj, aggregate_query: group },
          token
        );
        const { xlabels, ydata } = memoizeSortReducePareto(res);
        return {
          id: uuid(),
          paretos: { xlabels, ydata },
          aggregate_query: group,
          chart_title,
        };
      } catch (error) {
        return {};
      }
    })
  );
  setParetoArr((current) => paretoObjs);
};
