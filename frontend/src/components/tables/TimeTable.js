import PropTypes from "prop-types";
import { darkThemeClass } from "utils/utils";

function TimeTable(props) {
  const tabledt = darkThemeClass("dt-table", props.theme);
  return (
    <div className="table-responsive">
      <table className={`table table-bordered ${tabledt}`}>
        <tbody>
          <tr>
            <th scope="col">System Time</th>
            <th scope="col">{props.sysmonObj.chrony_info?.sys_time}</th>
          </tr>
          <tr>
            <th scope="col">Reference Time</th>
            <th scope="col">{props.sysmonObj.chrony_info?.ref_time}</th>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

TimeTable.propTypes = {
  sysmonObj: PropTypes.object,
  theme: PropTypes.string,
};

export default TimeTable;
