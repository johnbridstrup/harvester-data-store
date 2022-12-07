import { Link } from "react-router-dom";
import moment from "moment";
import { useSelector } from "react-redux";
import { LoaderDiv } from "../../styled";
import { Loader } from "../../../utils/utils";

function LogSessionList(props) {
  const { loading, logsessions } = useSelector((state) => state.logparser);
  return (
    <div className="table-responsive mb-4">
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Harvester</th>
              <th>Log Date</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {logsessions.map((log, _) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>
                  <Link to={`/logsession/${log.id}`}>{log.name}</Link>
                </td>
                <td>{log.logs?.harv_id}</td>
                <td>{moment(log.date_time).format("LLLL")}</td>
                <td>{moment(log.created).format("LLLL")}</td>
                <td>{moment(log.lastModified).format("LLLL")}</td>
                <td>
                  <Link to={`/logfiles/${log.id}`}>View Logs</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

LogSessionList.propTypes = {};

export default LogSessionList;
