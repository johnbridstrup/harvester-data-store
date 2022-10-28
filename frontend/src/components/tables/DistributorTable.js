import moment from "moment";
import PropTypes from "prop-types";

function DistributorTable(props) {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {props.distributors?.map((distributor, _) => (
            <tr key={distributor.id} className="tr-hover">
              <td>{distributor.id}</td>
              <td>{distributor.name}</td>
              <td>{moment(distributor.created).format("LLLL")}</td>
              <td>{moment(distributor.lastModified).format("LLLL")}</td>
              <td>
                <span>
                  <i
                    onClick={() => props.handleDistUpdateClick(distributor)}
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

DistributorTable.propTypes = {
  distributors: PropTypes.array,
  handleDistUpdateClick: PropTypes.func,
};

export default DistributorTable;
