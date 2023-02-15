import moment from "moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LoaderDiv } from "components/styled";
import { darkThemeClass, Loader, timeStampFormat } from "utils/utils";

function AutodiagList(props) {
  const { reports, loading } = useSelector((state) => state.autodiagnostic);
  const { timezone } = useSelector((state) => state.errorreport);
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
                <th>Report Time</th>
                <th>Result</th>
                <th>Robot</th>
                <th>Gripper SN</th>
                <th>Harvester</th>
                <th>Event</th>
                <th>Pick Session</th>
                <th>Created At</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((obj, _) => (
                <tr key={obj.id}>
                  <td>
                    <Link to={`/autodiagnostics/${obj.id}`}>
                      {timeStampFormat(obj.reportTime, timezone)}
                    </Link>
                  </td>
                  <td>{obj.true ? "success" : "failed"}</td>
                  <td>{obj.robot}</td>
                  <td>{obj.gripper_sn}</td>
                  <td>
                    <Link to={`/harvesters/${obj.harvester}`}>
                      {obj.harvester}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/events/${obj.event.id}`}>{obj.event.id}</Link>
                  </td>
                  <td>
                    <Link to={`/picksessions/${obj.pick_session.id}`}>
                      {obj.pick_session.id}
                    </Link>
                  </td>
                  <td>{moment(obj.createdAt).format("LLLL")}</td>
                  <td>{moment(obj.lastModified).format("LLLL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

AutodiagList.propTypes = {};

export default AutodiagList;
