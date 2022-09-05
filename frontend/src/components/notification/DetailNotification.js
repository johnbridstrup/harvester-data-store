import { useSelector } from "react-redux";

function DetailNotification(props) {
  const { notification } = useSelector((state) => state.notification);
  return (
    <div>
      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <span>
                <strong>Trigger On: </strong>
              </span>
              <div>{notification.trigger_on}</div>
            </div>
            <div className="col-md-4">
              <span>
                <strong>Recipients: </strong>
              </span>
              <div>{notification.recipients?.join(", ")}</div>
            </div>
            <div className="col-md-4">
              <span>
                <strong>Criteria: </strong>
              </span>
              <div>{JSON.stringify(notification.criteria)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

DetailNotification.propTypes = {};

export default DetailNotification;
