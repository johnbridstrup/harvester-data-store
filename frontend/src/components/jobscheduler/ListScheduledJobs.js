import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LoaderDiv } from "components/styled";
import { Loader, darkThemeClass } from "utils/utils";

function ListScheduledJobs(props) {
  const { scheduledjobs, loading } = useSelector((state) => state.jobscheduler);
  const { theme } = useSelector((state) => state.home);
  const tabledt = darkThemeClass("dt-table", theme);

  return (
    <>
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <div className="table-responsive">
          <table className={`table ${tabledt}`}>
            <thead>
              <tr>
                <td>ID</td>
                <td>Schedule Status</td>
                <td>Job Type</td>
                <td>Schema Version</td>
              </tr>
            </thead>
            <tbody>
              {scheduledjobs.map((job, _) => (
                <tr key={job.id}>
                  <td>
                    <Link to={`/scheduledjobs/${job.id}`}>{job.id}</Link>
                  </td>
                  <td>{job.schedule_status}</td>
                  <td>{job.job_def.jobtype}</td>
                  <td>{job.job_def.schema_version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

ListScheduledJobs.propTypes = {};

export default ListScheduledJobs;
