import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { getNotificationById } from "features/notification/notificationSlice";
import DetailNotification from "components/notification/DetailNotification";
import "./styles.css";

function NotificationDetail(props) {
  const params = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(getNotificationById(params.notifyId));
    })();
  }, [dispatch, params]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Notification"}
          className={"display-6 mt-4 mb-4"}
          reportId={params.notifyId}
        />
        <DetailNotification />
      </div>
    </MainLayout>
  );
}

NotificationDetail.propTypes = {};

export default NotificationDetail;
