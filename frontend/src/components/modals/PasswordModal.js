import PropTypes from "prop-types";

function PasswordModal(props) {
  return (
    <div className="col-md-8">
      <div
        className="modal fade"
        id="passwordModal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true"
        style={{ display: "none" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content profile-modal">
            <div
              className="text-right"
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <button
                type="button"
                className="btn closeModalBtn"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span className="las la-times"></span>
              </button>
            </div>
            <div className="modal-body text-center px-5 pb-2">
              ENTER PASSWORD
            </div>

            <div className="modal-body px-5 pb-4">
              <form onSubmit={props.handleSubmit}>
                <div className="form-group">
                  <label htmlFor="password">Enter Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={props.password}
                    onChange={props.handleChange}
                  />
                </div>
                <div className="form-group text-center mt-2 mb-2">
                  <button type="submit" className="btn btn-primary btn-sm">
                    Confirm
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

PasswordModal.propTypes = {
  password: PropTypes.string,
  handleSubmit: PropTypes.func,
  handleChange: PropTypes.func,
};

export default PasswordModal;
