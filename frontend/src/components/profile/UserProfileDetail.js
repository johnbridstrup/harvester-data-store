import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  changePassword,
  confirmPassword,
  updateProfile,
} from "../../features/auth/authSlice";
import {
  deleteNotification,
  listNotifications,
} from "../../features/notification/notificationSlice";
import { transformAssignedNotification } from "../../utils/utils";
import ConfirmModal from "../modals/ConfirmModal";
import PasswordModal from "../modals/PasswordModal";
import ProfileUpdateModal from "../modals/ProfileUpdateModal";
import {
  ChangePassword,
  Notifications,
  ProfileColLeft,
  ProfileColRight,
} from "./ProfileHelpers";

function UserProfileDetail(props) {
  const [fieldData, setFieldData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    slack_id: "",
    is_active: "",
    is_staff: "",
    is_superuser: "",
    last_login: "",
    password: "",
    new_password: "",
    current_password: "",
    confirm_password: "",
  });
  const [notifObj, setNotifObj] = useState(null)
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notification);
  const dispatch = useDispatch();
  const profileRef = useRef();
  const passwordRef = useRef();
  const confirmRef = useRef();

  const createdNotification = notifications
    .slice(0, 5)
    .filter((notification, index) => notification.creator === user?.id);
  const assignedNotification = transformAssignedNotification(
    notifications.slice(0, 5),
    user?.username
  );

  useEffect(() => {
    setFieldData((current) => {
      return {
        ...current,
        first_name: user && user.first_name ? user.first_name : "",
        last_name: user && user.last_name ? user.last_name : "",
        username: user && user.username ? user.username : "",
        email: user && user.email ? user.email : "",
        slack_id: user && user.profile?.slack_id ? user.profile?.slack_id : "",
        is_active: user && user.is_active ? user.is_active : false,
        is_staff: user && user.is_staff ? user.is_staff : false,
        is_superuser: user && user.is_superuser ? user.is_superuser : false,
        last_login: user && user.last_login ? user.last_login : "",
      };
    });
  }, [user]);

  const profileModalPopUp = () => {
    profileRef.current.click();
  };

  const passwordModalPopUp = () => {
    passwordRef.current.click();
  };

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...fieldData,
      userId: user.id,
      profile: { slack_id: fieldData.slack_id },
      password: undefined,
    };
    const res = await dispatch(updateProfile(data));
    if (res.type === "auth/updateProfile/fulfilled") {
      toast.success("profile information updated successfully");
      profileModalPopUp();
    } else if (res === "auth/updateProfile/rejected") {
      toast.error(res?.payload);
    } else {
      toast.error("something went wrong. please try again");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (fieldData.new_password !== fieldData.confirm_password) {
      toast.error("passwords do not match!");
    } else {
      const data = {
        current_password: fieldData.current_password,
        new_password: fieldData.new_password,
      };
      const res = await dispatch(changePassword(data));
      if (res.type === "auth/changePassword/fulfilled") {
        toast.success("password updated successfully");
      } else if (res.type === "auth/changePassword/rejected") {
        toast.error(res?.payload);
      } else {
        toast.error("something went wrong try again later");
      }
    }
  };

  const handleDeleteNotification = async () => {
    const res = await dispatch(deleteNotification(notifObj.id));
    if (res.type === "notification/deleteNotification/fulfilled") {
      toast.success("Notification deleted successfully");
      await dispatch(listNotifications());
      confirmPopUp(null)
    } else {
      toast.error("Could not delete the specified notification");
    }
  };

  const handleConfirmPassword = async (e) => {
    e.preventDefault();
    const data = {
      username: user?.username,
      password: fieldData.password,
    };
    const res = await dispatch(confirmPassword(data));
    if (res.type === "auth/confirmPassword/fulfilled") {
      passwordModalPopUp();
      setTimeout(() => {
        profileModalPopUp();
      }, 1000);
    } else {
      toast.error("could not authenticate with the given credentials");
    }
  };

  const confirmPopUp = (obj) => {
    setNotifObj(current => obj);
    confirmRef.current.click();
  };

  return (
    <>
      <div className="row gutters-sm mt-5">
        <div className="col-md-4 mb-3">
          <ProfileColLeft user={user} />
          <ChangePassword
            fieldData={fieldData}
            handleChange={handleFieldChange}
            handleSubmit={handlePasswordSubmit}
          />
        </div>
        <div className="col-md-8">
          <ProfileColRight
            user={user}
            profileModalPopUp={profileModalPopUp}
            profileRef={profileRef}
            passwordModalPopUp={passwordModalPopUp}
            passwordRef={passwordRef}
          />

          <div className="row gutters-sm">
            <div className="col-sm-6 mb-3">
              <Notifications
                user={user}
                notifications={createdNotification}
                notify_type={"Created"}
                confirmDel={confirmPopUp}
              />
            </div>
            <div className="col-sm-6 mb-3">
              <Notifications
                user={user}
                notifications={assignedNotification}
                notify_type={"Assigned"}
                confirmDel={confirmPopUp}
              />
            </div>
          </div>
        </div>
      </div>
      <ProfileUpdateModal
        fieldData={fieldData}
        handleChange={handleFieldChange}
        handleSubmit={handleProfileSubmit}
        loading={false}
      />
      <PasswordModal
        password={fieldData.password}
        handleChange={handleFieldChange}
        handleSubmit={handleConfirmPassword}
      />
      <ConfirmModal
        confirmRef={confirmRef}
        cancelRequest={confirmPopUp}
        handleDelete={handleDeleteNotification}
      />
    </>
  );
}

UserProfileDetail.propTypes = {};

export default UserProfileDetail;
