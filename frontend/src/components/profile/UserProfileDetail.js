import { useState, useRef } from "react";
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
    first_name: "John",
    last_name: "Doe",
    username: "aft",
    email: "aft@aft.aft",
    slack_id: "slack@aft.aft",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [assigned] = useState(notifications);
  const [created] = useState(notifications);
  const profileRef = useRef();
  const profileModalPopUp = () => {
    profileRef.current.click();
  };
  let user = {
    first_name: "John",
    last_name: "Doe",
    username: "aft",
    email: "aft@aft.aft",
    slack_id: "slack@aft.aft",
    is_active: true,
    is_staff: true,
    is_superuser: true,
    last_login: new Date().toLocaleDateString(),
  };
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
