import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  deleteManyNotif,
  listNotifications,
} from "../../features/notification/notificationSlice";
import {
  paramsToObject,
  transformAssignedNotification,
} from "../../utils/utils";
import NotificationTable from "../tables/NotificationTable";

function ListNotification(props) {
  const [checkedNotif, setCheckedNotif] = useState([]);
  const { user, token } = useSelector((state) => state.auth);
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

  const handleDeleteMany = async () => {
    const { success, message } = await deleteManyNotif(checkedNotif, token);
    if (success) {
      toast.success(message);
      dispatch(listNotifications());
    } else {
      toast.error(message);
    }
  };

  const handleChange = (e, notifObj) => {
    const notif = checkedNotif.slice();
    let exists = notif.find((x, i) => x.id === notifObj.id);
    let index = notif.findIndex((x, i) => x.id === notifObj.id);
    if (e.target.checked) {
      notif.push(notifObj);
    } else {
      if (exists) {
        notif.splice(index, 1);
      }
    }
    setCheckedNotif(notif);
  };

  return (
    <>
      {params.category === "created" ? (
        <NotificationTable
          notifications={createdNotification}
          user={user}
          checkedNotif={checkedNotif}
          handleChange={handleChange}
          handleDeleteMany={handleDeleteMany}
        />
      ) : params.category === "assigned" ? (
        <NotificationTable
          notifications={assignedNotification}
          user={user}
          checkedNotif={checkedNotif}
          handleChange={handleChange}
          handleDeleteMany={handleDeleteMany}
        />
      ) : (
        <NotificationTable
          notifications={notifications}
          user={user}
          checkedNotif={checkedNotif}
          handleChange={handleChange}
          handleDeleteMany={handleDeleteMany}
        />
      )}
    </>
  );
}

ListNotification.propTypes = {};

export default ListNotification;
