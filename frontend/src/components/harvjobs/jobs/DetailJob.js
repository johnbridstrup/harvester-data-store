import moment from "moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getHarvId } from "../../../utils/utils";

function DetailJob(props) {
  const { job } = useSelector((state) => state.harvjobs);
  return (
    <div className="mb-4">
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
  );
}

DetailJob.propTypes = {};

export default DetailJob;
