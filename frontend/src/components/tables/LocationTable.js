import PropTypes from "prop-types";
import moment from "moment";
import { darkThemeClass } from "utils/utils";

function LocationTable(props) {
  const tabledt = darkThemeClass("dt-table", props.theme);
  const rowdt = darkThemeClass("dt-row", props.theme);
  return (
    <div className="table-responsive">
      <table className={`table ${tabledt}`}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Distributor</th>
            <th>Ranch</th>
            <th>Country</th>
            <th>Region</th>
            <th>Site Channel</th>
            <th>Created By</th>
            <th>Updated By</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {props.locations?.map((location, _) => (
            <tr key={location.id} className={`tr-hover ${rowdt}`}>
              <td>{location.id}</td>
              <td>{location?.distributor?.name}</td>
              <td>{location.ranch}</td>
              <td>{location.country}</td>
              <td>{location.region}</td>
              <td>{location.site_channel}</td>
              <td>{location.creator?.username}</td>
              <td>{location.modifiedBy?.username}</td>
              <td>{moment(location.created).format("LLLL")}</td>
              <td>{moment(location.lastModified).format("LLLL")}</td>
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
  theme: PropTypes.string,
};

export default LocationTable;
