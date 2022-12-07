import moment from "moment";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getHarvId, timeStampFormat } from "../../../utils/utils";
import { RightButtonGroup, JobStatusHistory } from "../helpers";
import { handleDownload } from "../../../utils/services";
import DownloadModal from "../../modals/DownloadModal";
import ConfirmModal from "../../modals/ConfirmModal";
import { rescheduleJob } from "../../../features/harvjobs/harvjobSlice";
import { SUCCESS } from "../../../features/base/constants";

function DetailJob(props) {
  const [scheduling, setScheduling] = useState(false);
  const { job, jobresults, jobstatuses } = useSelector(
    (state) => state.harvjobs
  );
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const downloadRef = useRef(null);
  const confirmRef = useRef(null);

  const downloadPopUp = () => {
    downloadRef.current.click();
  };

  const download = async (fileObj) => {
    await handleDownload(fileObj, token);
  };

  const confirmPopUp = () => {
    confirmRef.current.click();
  };

  const handleReschedule = async () => {
    setScheduling(true);
    const res = await dispatch(rescheduleJob(job.id));
    if (res.payload?.status === SUCCESS) {
      toast.success(res.payload?.message);
      confirmPopUp();
    } else {
      confirmPopUp();
      toast.error(res.payload);
    }
    setScheduling(false);
  };

  return (
    <>
      <RightButtonGroup
        downloadRef={downloadRef}
        popUp={downloadPopUp}
        confirmPopUp={confirmPopUp}
        confirmRef={confirmRef}
      />
      <div className="mb-4 mt-3">
        <div className="card card-body mb-4">
          <div className="row">
            <div className="col-md-3 mb-2">
              <div className="f-w-600">ID</div>
              <div>{job.id}</div>
            </div>
            <div className="col-md-3 mb-2">
              <div className="f-w-600">Targets</div>
              <div>{job.payload?.targets?.join(", ")}</div>
            </div>
            <div className="col-md-3 mb-2">
              <div className="f-w-600">Job Type</div>
              <div>{job.payload?.job_type}</div>
            </div>
            <div className="col-md-3 mb-2">
              <div className="f-w-600">Timeout</div>
              <div>{job.payload?.timeout}</div>
            </div>
            <div className="col-md-3 mb-2">
              <div className="f-w-600">Status</div>
              <div
                className={`${
                  job.jobstatus === "Success"
                    ? "text-success"
                    : job.jobstatus === "Pending"
                    ? "text-warning"
                    : "text-danger"
                }`}
              >
                {job.jobstatus}
              </div>
            </div>
            <div className="col-md-3 mb-2">
              <div className="f-w-600">Target</div>
              <div>{getHarvId(job.results, job.target)}</div>
            </div>
            <div className="col-md-3 mb-2">
              <div className="f-w-600">Created At</div>
              <div>{moment(job.created).format("LLLL")}</div>
            </div>
            <div className="col-md-3 mb-2">
              <div className="f-w-600">Updated At</div>
              <div>{moment(job.lastModified).format("LLLL")}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="f-w-600">Job Results</div>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Time</th>
              <th>Host Results</th>
              <th>HarvID</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {jobresults.map((result, _) => (
              <tr key={result.id}>
                <td>
                  <Link to={`/jobresults/${result.id}`}>{result.id}</Link>
                </td>
                <td>{timeStampFormat(result.reportTime)}</td>
                <td>
                  {result.host_results.map((host, _id) => (
                    <div key={host.id}>
                      <span>{host.host}</span>{" "}
                      <span
                        className={`${
                          host.result === "Success"
                            ? "text-success"
                            : host.result === "Pending"
                            ? "text-warning"
                            : "text-danger"
                        }`}
                      >
                        {host.result}
                      </span>
                    </div>
                  ))}
                </td>
                <td>{result.report?.serial_number}</td>
                <td>{moment(result.created).format("LLLL")}</td>
                <td>{moment(result.lastModified).format("LLLL")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="f-w-600">Job Status</div>
      <JobStatusHistory jobstatuses={jobstatuses} />
      <DownloadModal eventObj={job?.event} handleDownload={download} />
      <ConfirmModal
        cancelRequest={confirmPopUp}
        confirmRef={confirmRef}
        handleDelete={handleReschedule}
        msg={"Are you sure you want to reschedule this job"}
        loading={scheduling}
      />
    </>
  );
}

DetailJob.propTypes = {};

export default DetailJob;
