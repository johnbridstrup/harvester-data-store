import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
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
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [assigned] = useState(notifications);
  const [created] = useState(notifications);
  const { user } = useSelector((state) => state.auth);
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
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    console.log(fieldData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    console.log(fieldData);
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
