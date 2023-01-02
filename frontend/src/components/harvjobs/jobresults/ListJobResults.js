import moment from "moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Loader, timeStampFormat } from "utils/utils";
import { LoaderDiv } from "components/styled";

function ListJobResults(props) {
  const { jobresults, loading } = useSelector((state) => state.harvjobs);
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
      )}
    </>
  );
}

ListJobResults.propTypes = {};

export default ListJobResults;
