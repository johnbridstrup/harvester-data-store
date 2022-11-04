import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { getHarvId, getUrl } from "../../../utils/utils";

function JobsTable(props) {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <td>ID</td>
            <td>Targets</td>
            <td>Timeout</td>
            <td>Status</td>
            <td>Target</td>
            <td>Results</td>
            <td>History</td>
          </tr>
        </thead>
        <tbody>
          {props.jobs.map((job, _) => (
            <tr key={job.id}>
              <td>
                <Link to={`/jobs/${job.id}`}>{job.id}</Link>
              </td>
              <td>{job.payload?.targets?.join(", ")}</td>
              <td>{job.payload?.timeout}</td>
              <td>{job.jobstatus}</td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

JobsTable.propTypes = {
  jobs: PropTypes.array,
};

export default JobsTable;
