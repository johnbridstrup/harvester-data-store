import PropTypes from "prop-types";
import { darkThemeClass, Loader } from "utils/utils";

function DistributorModal(props) {
  const { name, mode } = props.fieldData;
  const modal = darkThemeClass("dt-modal-content", props.theme);
  const inputdark = darkThemeClass("dt-form-control", props.theme);

  return (
    <div className="col-md-8">
      <div
        className="modal fade"
        id="distributorModal"
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
              {mode === "edit" ? "UPDATE" : "ADD NEW"} DISTRIBUTOR
            </div>

            <div className="modal-body px-5 pb-4">
              <form onSubmit={props.handleSubmit}>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        className={`form-control ${inputdark}`}
                        name="name"
                        id="name"
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

DistributorModal.propTypes = {
  fieldData: PropTypes.object,
  handleChange: PropTypes.func,
  handleSubmit: PropTypes.func,
  theme: PropTypes.string,
};

export default DistributorModal;
