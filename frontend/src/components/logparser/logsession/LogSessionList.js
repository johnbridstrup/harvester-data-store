import { Link } from "react-router-dom";
import moment from "moment";

function LogSessionList(props) {
  return (
    <div className="table-responsive">
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
          <tr>
            <td>1</td>
            <td>
              <Link to={`/logsession/1`}>sessclip_h5r2_202202081050.zip</Link>
            </td>
            <td>11</td>
            <td>{moment(new Date()).format("LLLL")}</td>
            <td>{moment(new Date()).format("LLLL")}</td>
            <td>{moment(new Date()).format("LLLL")}</td>
            <td>
              <Link to={`/logfiles/1`}>View Logs</Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

LogSessionList.propTypes = {};

export default LogSessionList;
