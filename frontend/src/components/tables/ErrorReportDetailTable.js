import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { HarvesterLink } from "components/common";
import { darkThemeClass, timeStampFormat } from "utils/utils";

function ErrorReportDetailTable(props) {
  const tabledt = darkThemeClass("dt-table", props.theme);
  return (
    <div className="row">
      <div className="col">
        <div className="table-responsive">
          <table className={`table ${tabledt}`}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Harvester</th>
                <th>Location</th>
                <th>Code</th>
                <th>Services</th>
                <th>Branch</th>
                <th>Githash</th>
                <th>Event</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {timeStampFormat(props.reportObj?.reportTime, props.timezone)}
                </td>
                <td>
                  <HarvesterLink harvester={props.reportObj?.harvester} />
                </td>
                <td>{props.reportObj?.location?.ranch}</td>
                <td>{props.reportObj?.code}</td>
                <td>{props.reportObj?.service}</td>
                <td>{props.reportObj?.gitbranch}</td>
                <td>{props.reportObj?.githash}</td>
                <td>
                  <Link to={`/events/${props.reportObj?.event?.id}`}>
                    {props.reportObj?.event?.id}
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

ErrorReportDetailTable.propTypes = {
  reportObj: PropTypes.object,
  timezone: PropTypes.string,
  theme: PropTypes.string,
};

export default ErrorReportDetailTable;
