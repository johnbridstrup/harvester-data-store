import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export const ProfileColLeft = (props) => {
  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex flex-column align-items-center text-center">
          <img
            src="https://bootdey.com/img/Content/avatar/avatar7.png"
            alt="Admin"
            className="rounded-circle"
            width="150"
          />
          <div className="mt-3">
            <h4>
              {props.user?.first_name} {props.user?.last_name}
            </h4>
            <p className="text-secondary mb-1">
              Slack Id {props.user?.slack_id}
            </p>
            <p className="text-muted font-size-sm">
              {props.user?.is_active
                ? "Profile is Active"
                : "Profile is Inactive"}
              ,{" "}
              {props.user?.is_staff
                ? "Profile has staff access"
                : "Profile is non-staff"}
              ,{" "}
              {props.user?.is_superuser
                ? "Profile is superuser"
                : "Profile is non-superuser"}
            </p>
            <p>Last Login {props.user?.last_login}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProfileColRight = (props) => {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="row">
          <div className="col-sm-3">
            <h6 className="mb-0">First Name</h6>
          </div>
          <div className="col-sm-9 text-secondary">
            {props.user?.first_name}
          </div>
        </div>
        <hr />
        <div className="row">
          <div className="col-sm-3">
            <h6 className="mb-0">Last Name</h6>
          </div>
          <div className="col-sm-9 text-secondary">{props.user?.last_name}</div>
        </div>
        <hr />
        <div className="row">
          <div className="col-sm-3">
            <h6 className="mb-0">Email</h6>
          </div>
          <div className="col-sm-9 text-secondary">{props.user?.email}</div>
        </div>
        <hr />
        <div className="row">
          <div className="col-sm-3">
            <h6 className="mb-0">Username</h6>
          </div>
          <div className="col-sm-9 text-secondary">{props.user?.username}</div>
        </div>
        <hr />
        <div className="row">
          <div className="col-sm-12 text-center">
            <button
              className="btn btn-primary"
              onClick={props.profileModalPopUp}
            >
              Edit
            </button>
            <button
              ref={props.profileRef}
              data-bs-toggle="modal"
              data-bs-target="#profileModal"
              style={{ display: "none" }}
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ChangePassword = (props) => {
  return (
    <div className="card mt-3">
      <div className="card-body">
        <form>
          <div>
            <h6 className="d-flex align-items-center mb-3">
              <i className="las la-lock size-2x mx-2"></i>
              Change Password
            </h6>
          </div>
          <div className="form-group">
            <label htmlFor="current_password">Current Password</label>
            <input
              type="password"
              name="current_password"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="new_password">New Password</label>
            <input
              type="password"
              name="new_password"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm_password">Confirm Password</label>
            <input
              type="password"
              name="confirm_password"
              className="form-control"
            />
          </div>
          <div className="mt-4 mb-3 text-center">
            <button className="btn btn-primary">Change</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Notifications = (props) => {
  return (
    <div className="card h-100">
      <div className="card-body">
        <h6 className="d-flex align-items-center mb-3">
          <i className="las la-bell size-2x mx-2"></i>
          Recent Notifications ({props.notify_type}) (5)
        </h6>
        <hr />
        <div className="mb-3 hover-div">
          <div>
            Notify {props.user?.username} when {props.notifyObj?.trigger_on} has{" "}
            {JSON.stringify(props.notifyObj?.criteria)}
          </div>
          props.
        </div>
        <div className="mb-3 hover-div">
          <div>
            Notify {props.user?.username} when {props.notifyObj?.trigger_on} has{" "}
            {JSON.stringify(props.notifyObj?.criteria)}
          </div>
        </div>
        <div className="mb-3 hover-div">
          <div>
            Notify {props.user?.username} when {props.notifyObj?.trigger_on} has{" "}
            {JSON.stringify(props.notifyObj?.criteria)}
          </div>
        </div>
        <div className="mb-3 hover-div">
          <div>
            Notify {props.user?.username} when {props.notifyObj?.trigger_on} has{" "}
            {JSON.stringify(props.notifyObj?.criteria)}
          </div>
        </div>
        <div className="mb-3 hover-div">
          <div>
            Notify {props.user?.username} when {props.notifyObj?.trigger_on} has{" "}
            {JSON.stringify(props.notifyObj?.criteria)}
          </div>
        </div>
        <div className="text-center">
          <Link to="/notifications/all" className="btn btn-primary ">
            View All
          </Link>
        </div>
      </div>
    </div>
  );
};

ProfileColLeft.propTypes = {
  user: PropTypes.object,
};

ProfileColRight.propTypes = {
  user: PropTypes.object,
  profileModalPopUp: PropTypes.func,
  profileRef: PropTypes.object,
};

ChangePassword.propTypes = {};

Notifications.propTypes = {
  user: PropTypes.object,
  notifyObj: PropTypes.object,
  notify_type: PropTypes.string,
};
