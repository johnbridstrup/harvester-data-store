import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Header from "../../../components/layout/header";
import MainLayout from "../../../components/layout/main";
import ListNotification from "../../../components/notification/ListNotification";
import { GenericPagination } from "../../../components/pagination/Pagination";
import { listNotifications } from "../../../features/notification/notificationSlice";
import "./styles.css";

function NotificationList(props) {
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      await dispatch(listNotifications());
    })();
  }, [dispatch]);
  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS Notifications"} className={"display-6 mt-4 mb-4"} />

        <ListNotification />
        <GenericPagination state="notification" />
      </div>
    </MainLayout>
  );
}

NotificationList.propTypes = {};

export default NotificationList;
