import PropTypes from "prop-types";
import { darkThemeClass, Loader } from "utils/utils";

function UserModal(props) {
  const {
    first_name,
    last_name,
    username,
    slack_id,
    email,
    password,
    password2,
    mode,
    is_staff,
  } = props.fieldData;
  const modal = darkThemeClass("dt-modal-content", props.theme);
  const inputdark = darkThemeClass("dt-form-control", props.theme);
  return (
    <div className="col-md-8">
      <div
        className="modal fade"
        id="userModal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="modal-center"
        aria-hidden="true"
        style={{ display: "none" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className={`modal-content ${modal}`}>
            <div className="text-right">
              <button
                type="button"
                className="btn"
                data-bs-dismiss="modal"
                aria-label="close"
              >
                <span
                  className={`las la-times ${modal && "text-white"}`}
                ></span>
              </button>
            </div>
            <div className="modal-body text-center px-5 pb-2">
              {mode === "add" ? "ADD NEW" : "EDIT"} USER
            </div>

            <div className="modal-body px-5 pb-4">
              <form onSubmit={props.handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="first_name">First Name</label>
                      <input
                        type="text"
                        className={`form-control ${inputdark}`}
                        name="first_name"
                        id="first_name"
                        value={first_name}
                        onChange={props.handleChange}
                        required={mode === "add" ? true : false}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="last_name">Last Name</label>
                      <input
                        type="text"
                        className={`form-control ${inputdark}`}
                        name="last_name"
                        id="last_name"
                        value={last_name}
                        onChange={props.handleChange}
                        required={mode === "add" ? true : false}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="slack_id">Slack ID</label>
                      <input
                        type="text"
                        className={`form-control ${inputdark}`}
                        name="slack_id"
                        id="slack_id"
                        value={slack_id}
                        onChange={props.handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        className={`form-control ${inputdark}`}
                        name="email"
                        id="email"
                        value={email}
                        onChange={props.handleChange}
                        required={mode === "add" ? true : false}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <input
                        type="text"
                        className={`form-control ${inputdark}`}
                        name="username"
                        id="username"
                        value={username}
                        onChange={props.handleChange}
                        required={mode === "add" ? true : false}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check mt-4">
                      <input
                        className="form-check-input"
                        name="is_staff"
                        type="checkbox"
                        value=""
                        id="is_staff"
                        checked={is_staff ? true : false}
                        onChange={props.handleChange}
                      />
                      <label className="form-check-label" htmlFor="is_staff">
                        Is Staff User
                      </label>
                    </div>
                  </div>
                </div>
                {mode === "add" && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                          type="password"
                          className={`form-control ${inputdark}`}
                          name="password"
                          id="password"
                          value={password}
                          onChange={props.handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="password2">Confirm Password</label>
                        <input
                          type="password"
                          className={`form-control ${inputdark}`}
                          name="password2"
                          id="password2"
                          value={password2}
                          onChange={props.handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-block btn-primary mt-4 mb-4"
                  >
                    {props.loading ? (
                      <Loader size={25} />
                    ) : mode === "add" ? (
                      "ADD"
                    ) : (
                      "EDIT"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

UserModal.propTypes = {
  handleChange: PropTypes.func,
  fieldData: PropTypes.object,
  handleSubmit: PropTypes.func,
  loading: PropTypes.bool,
  theme: PropTypes.string,
};

export default UserModal;
