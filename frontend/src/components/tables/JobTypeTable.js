import moment from "moment";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { darkThemeClass } from "utils/utils";

function JobTypeTable(props) {
  const tabledt = darkThemeClass("dt-table", props.theme);
  return (
    <div className="table-responsive">
      <table className={`table ${tabledt}`}>
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
          {props.jobtypes.map((jobtype, _) => (
            <tr key={jobtype.id}>
              <td>
                <Link to={`/jobtypes/${jobtype.id}`}>{jobtype.id}</Link>
              </td>
              <td>{jobtype.name}</td>
              <td>{moment(jobtype.created).format("LLLL")}</td>
              <td>{moment(jobtype.lastModified).format("LLLL")}</td>
              <td>
                <i
                  onClick={() => props.handleJTUpdateClick(jobtype)}
                  className="las la-pencil-alt"
                ></i>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

JobTypeTable.propTypes = {
  jobtypes: PropTypes.array,
  handleJTUpdateClick: PropTypes.func,
  theme: PropTypes.string,
};

export default JobTypeTable;
