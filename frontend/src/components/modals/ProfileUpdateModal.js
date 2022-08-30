import { Loader } from "../../utils/utils";

function ProfileUpdateModal(props) {
  const handleSubmit = (e) => console.log(e.target);
  let loading = false;
  return (
    <div className="col-md-8">
      <div
        className="modal fade"
        id="profileModal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true"
        style={{ display: "none" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content profile-modal">
            <div className="text-right">
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
              UPDATE PROFILE
            </div>

            <div className="modal-body px-5 pb-4">
              <form onSubmit={(e) => handleSubmit(e)}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="first_name">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="first_name"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="last_name">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="last_name"
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
                        className="form-control"
                        name="slack_id"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        name="username"
                      />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-block btn-primary mt-4 mb-4"
                  >
                    {loading ? <Loader size={25} /> : "EDIT"}
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

ProfileUpdateModal.propTypes = {};

export default ProfileUpdateModal;
