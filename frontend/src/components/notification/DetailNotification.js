import { useSelector } from "react-redux";
import { darkThemeClass } from "utils/utils";

function DetailNotification(props) {
  const { notification } = useSelector((state) => state.notification);
  const { theme } = useSelector((state) => state.home);
  const cardtheme = darkThemeClass("dt-card-theme", theme);
  return (
    <div>
      <div className={`card ${cardtheme}`}>
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
