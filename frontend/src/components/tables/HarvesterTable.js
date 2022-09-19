import PropTypes from "prop-types";

function HarvesterTable(props) {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Harv ID</th>
            <th>Fruit</th>
            <th>Location</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {props.harvesters?.map((harvester, index) => (
            <tr key={index} className="tr-hover">
              <td>{harvester.name}</td>
              <td>{harvester.harv_id}</td>
              <td>{harvester.fruit?.name}</td>
              <td>{harvester.location?.ranch}</td>
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
