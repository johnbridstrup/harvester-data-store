import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { darkThemeClass } from "utils/utils";

function HarvesterDetailTable({ harvester, theme }) {
  const tabledt = darkThemeClass("dt-table", theme);
  const rowdt = darkThemeClass("dt-row", theme);
  return (
    <div className="table-responsive mb-4">
      <table className={`table ${tabledt}`}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Harv ID</th>
            <th>Fruit</th>
            <th>Location</th>
            <th>Emulator</th>
            <th>Harvester History</th>
            <th>Version History</th>
          </tr>
        </thead>
        <tbody>
          <tr className={`tr-hover ${rowdt}`}>
            <td>{harvester.name}</td>
            <td>{harvester.harv_id}</td>
            <td>{harvester.fruit?.name}</td>
            <td>{harvester.location?.ranch}</td>
            <td>{harvester.is_emulator ? "True" : "False"}</td>
            <td>
              <Link to={`${harvester.harvester_history}`}>
                <i className="las la-eye"></i>
              </Link>
            </td>
            <td>
              <Link
                to={`/harvesters/${harvester.id}/${harvester.version_history}`}
              >
                <i className="las la-eye"></i>
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

HarvesterDetailTable.propTypes = {
  harvester: PropTypes.object,
  theme: PropTypes.string,
};

export default HarvesterDetailTable;
