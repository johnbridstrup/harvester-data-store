import PropTypes from "prop-types";

function LocationTable(props) {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Distributor</th>
            <th>Ranch</th>
            <th>Country</th>
            <th>Region</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {props.locations?.map((location, index) => (
            <tr key={index} className="tr-hover">
              <td>{location?.distributor?.name}</td>
              <td>{location.ranch}</td>
              <td>{location.country}</td>
              <td>{location.region}</td>
              <td>
                <span>
                  <i
                    onClick={() => props.handleLocUpdateClick(location)}
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

LocationTable.propTypes = {
  locations: PropTypes.array,
  handleLocUpdateClick: PropTypes.func,
};

export default LocationTable;
