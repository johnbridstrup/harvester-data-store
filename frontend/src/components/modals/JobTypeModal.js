import PropTypes from "prop-types";
import { Loader } from "../../utils/utils";

function JobTypeModal(props) {
  const { name, mode } = props.fieldData;
  return (
    <div className="col-md-8">
      <div
        className="modal fade"
        id="jobTypeModal"
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
              {mode === "edit" ? "UPDATE" : "ADD NEW"} JOB TYPE
            </div>

            <div className="modal-body px-5 pb-4">
              <form onSubmit={props.handleSubmit}>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={name}
                        required
                        onChange={props.handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-block btn-primary mt-4 mb-4"
                  >
                    {props.loading ? (
                      <Loader size={25} />
                    ) : mode === "edit" ? (
                      "EDIT"
                    ) : (
                      "ADD"
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

JobTypeModal.propTypes = {
  handleChange: PropTypes.func,
  fieldData: PropTypes.object,
  handleSubmit: PropTypes.func,
  loading: PropTypes.bool,
};

export default JobTypeModal;
