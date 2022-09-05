import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  deleteNotification,
  listNotifications,
} from "../../features/notification/notificationSlice";
import {
  paramsToObject,
  transformAssignedNotification,
} from "../../utils/utils";
import NotificationTable from "../tables/NotificationTable";

function ListNotification(props) {
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notification);
  const dispatch = useDispatch();
  const { search } = useLocation();
  const params = paramsToObject(search);
  const createdNotification = notifications.filter(
    (x, i) => x.creator === user?.id
  );
  const assignedNotification = transformAssignedNotification(
    notifications,
    user?.username
  );

  const handleDelete = async (notifObj) => {
    const res = await dispatch(deleteNotification(notifObj.id));
    if (res.type === "notification/deleteNotification/fulfilled") {
      toast.success("Notification deleted successfully");
      await dispatch(listNotifications());
    } else {
      toast.error("Could not delete the specified notification");
    }
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
