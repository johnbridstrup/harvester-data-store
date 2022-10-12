import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import Header from "../../../components/layout/header";
import MainLayout from "../../../components/layout/main";
import ListNotification from "../../../components/notification/ListNotification";
import { GenericPagination } from "../../../components/pagination/Pagination";
import { MAX_LIMIT } from "../../../features/base/constants";
import {
  listNotifications,
  queryNotification,
} from "../../../features/notification/notificationSlice";
import { paramsToObject } from "../../../utils/utils";
import "./styles.css";

function NotificationList(props) {
  const { search } = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (search) {
      (async () => {
        const queryObj = paramsToObject(search);
        queryObj["limit"] = MAX_LIMIT;
        await dispatch(queryNotification(queryObj));
      })();
    } else {
      (async () => {
        await dispatch(listNotifications());
      })();
    }
  }, [dispatch, search]);
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
