import { useRef } from "react";
import ProfileUpdateModal from "../modals/ProfileUpdateModal";
import {
  ChangePassword,
  Notifications,
  ProfileColLeft,
  ProfileColRight,
} from "./ProfileHelpers";

function UserProfileDetail(props) {
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
  let notifyObj = {
    criteria: {
      harvester__harv_id__in: [11, 100],
      exceptions__code__code__in: ["1", "2"],
    },
    trigger_on: "ErrorReport",
  };
  return (
    <>
      <div className="row gutters-sm mt-5">
        <div className="col-md-4 mb-3">
          <ProfileColLeft user={user} />
          <ChangePassword />
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
                notifyObj={notifyObj}
                notify_type={"Created"}
              />
            </div>
            <div className="col-sm-6 mb-3">
              <Notifications
                user={user}
                notifyObj={notifyObj}
                notify_type={"Assigned"}
              />
            </div>
          </div>
        </div>
      </div>
      <ProfileUpdateModal />
    </>
  );
}

UserProfileDetail.propTypes = {};

export default UserProfileDetail;
