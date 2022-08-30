import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { updateProfile } from "../../features/auth/authSlice";
import { uuid } from "../../utils/utils";
import ProfileUpdateModal from "../modals/ProfileUpdateModal";
import {
  ChangePassword,
  Notifications,
  ProfileColLeft,
  ProfileColRight,
} from "./ProfileHelpers";

const notifications = [
  {
    id: uuid(),
    criteria: {
      harvester__harv_id__in: [11, 100],
      exceptions__code__code__in: ["1", "2"],
    },
    trigger_on: "ErrorReport",
  },
  {
    id: uuid(),
    criteria: {
      harvester__harv_id__in: [11, 100],
      exceptions__code__code__in: ["1", "2"],
    },
    trigger_on: "ErrorReport",
  },
  {
    id: uuid(),
    criteria: {
      harvester__harv_id__in: [11, 100],
      exceptions__code__code__in: ["1", "2"],
    },
    trigger_on: "ErrorReport",
  },
  {
    id: uuid(),
    criteria: {
      harvester__harv_id__in: [11, 100],
      exceptions__code__code__in: ["1", "2"],
    },
    trigger_on: "ErrorReport",
  },
  {
    id: uuid(),
    criteria: {
      harvester__harv_id__in: [11, 100],
      exceptions__code__code__in: ["1", "2"],
    },
    trigger_on: "ErrorReport",
  },
];

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
    new_password: "",
    confirm_password: "",
  });
  const [assigned] = useState(notifications);
  const [created] = useState(notifications);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const profileRef = useRef();
  const profileModalPopUp = () => {
    profileRef.current.click();
  };

  useEffect(() => {
    setFieldData((current) => {
      return {
        ...current,
        first_name: user && user.first_name ? user.first_name : "",
        last_name: user && user.last_name ? user.last_name : "",
        username: user && user.username ? user.username : "",
        email: user && user.email ? user.email : "",
        slack_id: user && user.profile?.slack_id ? user.profile?.slack_id : "",
        is_active: user && user.is_active ? user.is_active : "",
        is_staff: user && user.is_staff ? user.is_staff : "",
        is_superuser: user && user.is_superuser ? user.is_superuser : "",
        last_login: user && user.last_login ? user.last_login : "",
      };
    });
  }, [user]);

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
    };
    const res = await dispatch(updateProfile(data));
    if (res.type === "auth/updateProfile/fulfilled") {
      toast.success("profile information updated successfully");
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
      const data = { userId: user.id, password: fieldData.new_password };
      const res = await dispatch(updateProfile(data));
      if (res.type === "auth/updateProfile/fulfilled") {
        toast.success("password updated successfully");
      } else if (res.type === "auth/updateProfile/rejected") {
        toast.error(res?.payload + " minimum password length 5 characters");
      } else {
        toast.error("something went wrong try again later");
      }
    }
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
          />

          <div className="row gutters-sm">
            <div className="col-sm-6 mb-3">
              <Notifications
                user={user}
                notifications={created}
                notify_type={"Created"}
              />
            </div>
            <div className="col-sm-6 mb-3">
              <Notifications
                user={user}
                notifications={assigned}
                notify_type={"Assigned"}
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
    </>
  );
}

UserProfileDetail.propTypes = {};

export default UserProfileDetail;
