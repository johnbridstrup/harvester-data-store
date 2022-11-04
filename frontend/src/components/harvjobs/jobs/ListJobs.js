import moment from "moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getHarvId, getUrl, Loader } from "../../../utils/utils";
import { LoaderDiv } from "../../styled";

function ListJobs(props) {
  const { jobs, loading } = useSelector((state) => state.harvjobs);
  return (
    <>
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Targets</th>
                <th>JobType</th>
                <th>Timeout</th>
                <th>Status</th>
                <th>Target</th>
                <th>Results</th>
                <th>History</th>
                <th>Created At</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, _) => (
                <tr key={job.id}>
                  <td>
                    <Link to={`/jobs/${job.id}`}>{job.id}</Link>
                  </td>
                  <td>{job.payload.targets.join(", ")}</td>
                  <td>{job.payload.job_type}</td>
                  <td>{job.payload.timeout}</td>
                  <td
                    className={`${
                      job.jobstatus === "Success"
                        ? "text-success"
                        : job.jobstatus === "Pending"
                        ? "text-warning"
                        : "text-danger"
                    }`}
                  >
                    {job.jobstatus}
                  </td>
                  <td>{getHarvId(job.results, job.target)}</td>
                  <td>
                    <Link to={`/${getUrl(job.results)}`}>
                      <i className="las la-eye"></i>
                    </Link>
                  </td>
                  <td>
                    <Link to={`/jobstatus/${job.id}`}>
                      <i className="las la-eye"></i>
                    </Link>
                  </td>
                  <td>{moment(job.created).format("LLLL")}</td>
                  <td>{moment(job.lastModified).format("LLLL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

ListJobs.propTypes = {};

export default ListJobs;
