import { useEffect } from "react";
import { useDispatch } from "react-redux";
import MainLayout from "../../../components/layout/main";
import UserProfileDetail from "../../../components/profile/UserProfileDetail";
import { MAX_LIMIT } from "../../../features/base/constants";
import { listNotifications } from "../../../features/notification/notificationSlice";
import "./styles.css";

function UserProfileView(props) {
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      await dispatch(listNotifications(MAX_LIMIT));
    })();
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <UserProfileDetail />
      </div>
    </MainLayout>
  );
}

UserProfileView.propTypes = {};

export default UserProfileView;
