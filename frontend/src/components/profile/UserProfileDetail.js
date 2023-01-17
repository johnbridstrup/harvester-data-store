import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  changePassword,
  confirmPassword,
  updateProfile,
} from "features/auth/authSlice";
import {
  FULLFILLED_PROMISE,
  NOTIFY_CATEGORY,
  REJECTED_PROMISE,
  SUCCESS,
  THEME_MODES,
} from "features/base/constants";
import notificationService from "features/notification/notificationService";
import { deleteNotification } from "features/notification/notificationSlice";
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
  const [notifObj, setNotifObj] = useState(null);
  const [created, setCreated] = useState([]);
  const [isRecipient, setIsRecipient] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, token } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.home);
  const dispatch = useDispatch();
  const profileRef = useRef();
  const passwordRef = useRef();
  const confirmRef = useRef();
  const createdNotification = created.slice(0, 5);
  const assignedNotification = isRecipient.slice(0, 5);

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

  const fetchNotification = useCallback(() => {
    (async () => {
      try {
        setLoading(true);
        const [createdResult, recipientResult] = await Promise.all([
          notificationService.queryNotification(
            { category: NOTIFY_CATEGORY.created },
            token
          ),
          notificationService.queryNotification(
            { category: NOTIFY_CATEGORY.isRecipient },
            token
          ),
        ]);

        setCreated((current) => createdResult.results);
        setIsRecipient((current) => recipientResult.results);
        setLoading(false);
      } catch (error) {
        setCreated((current) => []);
        setIsRecipient((current) => []);
        setLoading(false);
      }
    })();
  }, [token]);

  useEffect(() => {
    fetchNotification();
  }, [fetchNotification]);

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
    if (res.payload?.status === SUCCESS) {
      toast.success(res.payload?.message, {
        theme: theme === THEME_MODES.AUTO_THEME ? "colored" : theme,
      });
      profileModalPopUp();
    } else if (res.type === REJECTED_PROMISE.profile) {
      toast.error(res?.payload, {
        theme: theme === THEME_MODES.AUTO_THEME ? "colored" : theme,
      });
    } else {
      toast.error("something went wrong. please try again", {
        theme: theme === THEME_MODES.AUTO_THEME ? "colored" : theme,
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (fieldData.new_password !== fieldData.confirm_password) {
      toast.error("passwords do not match!", {
        theme: theme === THEME_MODES.AUTO_THEME ? "colored" : theme,
      });
    } else {
      const data = {
        current_password: fieldData.current_password,
        new_password: fieldData.new_password,
      };
      const res = await dispatch(changePassword(data));
      if (res.payload?.status === SUCCESS) {
        toast.success(res.payload?.data?.message, {
          theme: theme === THEME_MODES.AUTO_THEME ? "colored" : theme,
        });
      } else if (res.type === REJECTED_PROMISE.password) {
        toast.error(res?.payload, {
          theme: theme === THEME_MODES.AUTO_THEME ? "colored" : theme,
        });
      } else {
        toast.error("something went wrong try again later", {
          theme: theme === THEME_MODES.AUTO_THEME ? "colored" : theme,
        });
      }
    }
  };

  const handleDeleteNotification = async () => {
    const res = await dispatch(deleteNotification(notifObj.id));
    if (res.type === FULLFILLED_PROMISE.notification) {
      toast.success("Notification deleted successfully", {
        theme: theme === THEME_MODES.AUTO_THEME ? "colored" : theme,
      });
      fetchNotification();
      confirmPopUp(null);
    } else {
      toast.error("Could not delete the specified notification", {
        theme: theme === THEME_MODES.AUTO_THEME ? "colored" : theme,
      });
    }
  };

  const handleConfirmPassword = async (e) => {
    e.preventDefault();
    const data = {
      username: user?.username,
      password: fieldData.password,
    };
    const res = await dispatch(confirmPassword(data));
    if (res.payload?.status === SUCCESS) {
      passwordModalPopUp();
      setTimeout(() => {
        profileModalPopUp();
      }, 1000);
    } else {
      toast.error("could not authenticate with the given credentials", {
        theme: theme === THEME_MODES.AUTO_THEME ? "colored" : theme,
      });
    }
  };

  const confirmPopUp = (obj) => {
    setNotifObj((current) => obj);
    confirmRef.current.click();
  };

  return (
    <>
      <div className="row gutters-sm mt-5">
        <div className="col-md-4 mb-3">
          <ProfileColLeft user={user} theme={theme} />
          <ChangePassword
            fieldData={fieldData}
            handleChange={handleFieldChange}
            handleSubmit={handlePasswordSubmit}
            theme={theme}
          />
        </div>
        <div className="col-md-8">
          <ProfileColRight
            user={user}
            profileModalPopUp={profileModalPopUp}
            profileRef={profileRef}
            passwordModalPopUp={passwordModalPopUp}
            passwordRef={passwordRef}
            theme={theme}
          />

          <div className="row gutters-sm">
            <div className="col-sm-6 mb-3">
              <Notifications
                user={user}
                notifications={createdNotification}
                notify_type={NOTIFY_CATEGORY.created.toUpperCase()}
                confirmDel={confirmPopUp}
                count={created.length}
                loading={loading}
                theme={theme}
              />
            </div>
            <div className="col-sm-6 mb-3">
              <Notifications
                user={user}
                notifications={assignedNotification}
                notify_type={NOTIFY_CATEGORY.isRecipient.toUpperCase()}
                confirmDel={confirmPopUp}
                count={isRecipient.length}
                loading={loading}
                theme={theme}
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
        theme={theme}
      />
      <PasswordModal
        password={fieldData.password}
        handleChange={handleFieldChange}
        handleSubmit={handleConfirmPassword}
        theme={theme}
      />
      <ConfirmModal
        confirmRef={confirmRef}
        cancelRequest={confirmPopUp}
        confirmRequest={handleDeleteNotification}
        msg={"Are you sure you want to delete the selected notification(s)"}
        theme={theme}
      />
    </>
  );
}

UserProfileDetail.propTypes = {};

export default UserProfileDetail;
