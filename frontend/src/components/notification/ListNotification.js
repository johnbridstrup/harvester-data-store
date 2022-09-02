import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  paramsToObject,
  transformAssignedNotification,
} from "../../utils/utils";
import NotificationTable from "../tables/NotificationTable";

function ListNotification(props) {
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notification);
  const { search } = useLocation();
  const params = paramsToObject(search);
  const createdNotification = notifications.filter(
    (x, i) => x.creator === user?.id
  );
  const assignedNotification = transformAssignedNotification(
    notifications,
    user?.username
  );

  return (
    <>
      {params.category === "created" ? (
        <NotificationTable notifications={createdNotification} />
      ) : params.category === "assigned" ? (
        <NotificationTable notifications={assignedNotification} />
      ) : (
        <NotificationTable notifications={notifications} />
      )}
    </>
  );
}

ListNotification.propTypes = {};

export default ListNotification;
