import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Loader, timeStampFormat } from "../../utils/utils";
import { GenericPagination } from "../pagination/Pagination";
import { LoaderDiv } from "../styled";

function RecentHarvErrors(props) {
  const { reports, timezone, loading } = useSelector(
    (state) => state.errorreport
  );

  return (
    <>
      <div className="recent-error">Recent Errors</div>
      <div className="table-responsive">
        {loading ? (
          <LoaderDiv>
            <Loader size={25} />
          </LoaderDiv>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Time</th>
                <th>Code</th>
                <th>Services</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={index}>
                  <td>{report.id}</td>
                  <td>
                    <Link to={`/errorreports/${report.id}`}>
                      {timeStampFormat(report.reportTime, timezone)}
                    </Link>
                  </td>
                  <td>{report.code}</td>
                  <td>{report.service}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <GenericPagination state="errorreport" />
    </>
  );
}

RecentHarvErrors.propTypes = {};

export default RecentHarvErrors;
