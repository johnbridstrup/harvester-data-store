import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

function NotificationTable(props) {
  const navigate = useNavigate();
  const handleClick = (notif) => navigate(`/notifications/${notif.id}`);
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Trigger On</th>
            <th>Recipients</th>
            <th>Criteria</th>
          </tr>
        </thead>
        <tbody>
          {props.notifications.map((notif, index) => (
            <tr key={index} onClick={() => handleClick(notif)}>
              <td>{notif.trigger_on}</td>
              <td>{notif.recipients.join(", ")}</td>
              <td>{JSON.stringify(notif.criteria)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

NotificationTable.propTypes = {
  notifications: PropTypes.array,
};

export default NotificationTable;
