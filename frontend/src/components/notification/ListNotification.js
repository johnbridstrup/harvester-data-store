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

  const handleDelete = (notifObj) => {
    console.log(notifObj);
  };

  return (
    <>
      {params.category === "created" ? (
        <NotificationTable
          notifications={createdNotification}
          handleDelete={handleDelete}
          user={user}
        />
      ) : params.category === "assigned" ? (
        <NotificationTable
          notifications={assignedNotification}
          handleDelete={handleDelete}
          user={user}
        />
      ) : (
        <NotificationTable
          notifications={notifications}
          handleDelete={handleDelete}
          user={user}
        />
      )}
    </>
  );
}

ListNotification.propTypes = {};

export default ListNotification;
