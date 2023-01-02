import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { MAX_LIMIT } from "features/base/constants";
import {
  deleteManyNotif,
  listNotifications,
  queryNotification,
} from "features/notification/notificationSlice";
import { paramsToObject } from "utils/utils";
import ConfirmModal from "../modals/ConfirmModal";
import NotificationTable from "../tables/NotificationTable";

function ListNotification(props) {
  const [checkedNotif, setCheckedNotif] = useState([]);
  const { user, token } = useSelector((state) => state.auth);
  const { notifications, loading } = useSelector((state) => state.notification);
  const dispatch = useDispatch();
  const confirmRef = useRef();
  const { search } = useLocation();

  const handleDeleteMany = async () => {
    const { success, message } = await deleteManyNotif(checkedNotif, token);
    if (success) {
      toast.success(message);
      setCheckedNotif((current) => []);
      if (search) {
        let queryObj = paramsToObject(search);
        queryObj["limit"] = MAX_LIMIT;
        await dispatch(queryNotification(queryObj));
      } else {
        await dispatch(listNotifications());
      }
      confirmPopUp();
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

  const confirmPopUp = () => {
    confirmRef.current.click();
  };

  return (
    <>
      <NotificationTable
        notifications={notifications}
        user={user}
        checkedNotif={checkedNotif}
        handleChange={handleChange}
        handleDeleteMany={confirmPopUp}
        loading={loading}
      />

      <ConfirmModal
        confirmRequest={handleDeleteMany}
        cancelRequest={confirmPopUp}
        confirmRef={confirmRef}
        msg={"Are you sure you want to delete the selected notification(s)"}
      />
    </>
  );
}

ListNotification.propTypes = {};

export default ListNotification;
