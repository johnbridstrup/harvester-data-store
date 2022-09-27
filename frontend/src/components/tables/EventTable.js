import PropTypes from "prop-types";
import moment from "moment"
import { Link } from "react-router-dom";

function EventTable(props) {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>UUID</th>
            <th>Related Objects</th>
            <th>Related Files</th>
            <th>Created At</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {props.events.map((eventObj, index) => (
            <tr key={index}>
              <td>
                <Link to={`/events/${eventObj.id}`}>{eventObj.UUID}</Link>
              </td>
              <td>
                {eventObj.related_objects.map((obj, index) => (
                  <div key={index}>
                    <Link to={obj.url}>{obj.object}</Link>
                  </div>
                ))}
              </td>
              <td>
                {eventObj.related_files.map((obj, index) => (
                  <div key={index}>
                    <a href="#!" onClick={() => props.handleDownload(obj)}>
                      {obj.filetype}
                    </a>
                  </div>
                ))}
              </td>
              <td>{moment(eventObj.createdAt).format("LLLL")}</td>
              <td>{moment(eventObj.lastModified).format("LLLL")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

EventTable.propTypes = {
  events: PropTypes.array.isRequired,
  handleDownload: PropTypes.func
};

export default EventTable;
