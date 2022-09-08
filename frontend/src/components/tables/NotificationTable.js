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
            <th>
              {props.checkedNotif.length > 0 ? (
                <button
                  onClick={props.handleDeleteMany}
                  className="btn btn-sm btn-danger"
                >
                  DEL
                </button>
              ) : (
                "Action"
              )}
            </th>
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
                  <input
                    type="checkbox"
                    className="form-check-input"
                    onChange={(e) => props.handleChange(e, notif)}
                  />
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
  handleDeleteMany: PropTypes.func,
  user: PropTypes.object,
  handleChange: PropTypes.func,
  checkedNotif: PropTypes.array,
};

export default NotificationTable;
