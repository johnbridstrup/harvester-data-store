import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function HarvesterTable(props) {
  return (
    <div className="table-responsive mb-4">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Harv ID</th>
            <th>Fruit</th>
            <th>Location</th>
            <th>Emulator</th>
            <th>Harvester History</th>
            <th>Version History</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {props.harvesters?.map((harvester, _) => (
            <tr key={harvester.id} className="tr-hover">
              <td>{harvester.id}</td>
              <td>
                <Link to={`/harvesters/${harvester.id}`}>{harvester.name}</Link>
              </td>
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
              <td>
                <span>
                  <i
                    onClick={() => props.handleHarvUpdateClick(harvester)}
                    className="las la-pencil-alt"
                  ></i>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

HarvesterTable.propTypes = {
  harvesters: PropTypes.array,
  handleHarvUpdateClick: PropTypes.func,
};

export default HarvesterTable;
