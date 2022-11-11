import moment from "moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getHarvId } from "../../../utils/utils";
import { timeStampFormat } from "../../../utils/utils";
import { JobStatusHistory } from "../helpers";

function DetailJob(props) {
  const { job, jobresults, jobstatuses } = useSelector(
    (state) => state.harvjobs
  );
  return (
    <>
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
    </>
  );
}

DetailJob.propTypes = {};

export default DetailJob;
