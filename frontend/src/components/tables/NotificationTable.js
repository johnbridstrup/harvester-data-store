import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function NotificationTable(props) {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Trigger On</th>
            <th>Recipients</th>
            <th>Criteria</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {props.notifications.map((notif, index) => (
            <tr key={index}>
              <td>
                <Link to={`/notifications/${notif.id}`} className="notif-link">
                  {notif.trigger_on}
                </Link>
              </td>
              <td>{notif.recipients.join(", ")}</td>
              <td>{JSON.stringify(notif.criteria)}</td>
              <td>
                {(props.user?.id === notif.creator ||
                  props.user?.is_superuser === true) && (
                  <i
                    onClick={() => props.handleDelete(notif)}
                    className="las la-times"
                  ></i>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

NotificationTable.propTypes = {
  notifications: PropTypes.array,
  handleDelete: PropTypes.func,
  user: PropTypes.object,
};

export default NotificationTable;
