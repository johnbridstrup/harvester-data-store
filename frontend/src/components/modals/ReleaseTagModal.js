import PropTypes from "prop-types";
import { darkThemeClass, Loader } from "utils/utils";

function ReleaseTagModal(props) {
  const { tag } = props.fieldData;
  const modal = darkThemeClass("dt-modal-content", props.theme);
  const inputdark = darkThemeClass("dt-form-control", props.theme);
  return (
    <div className="col-md-8">
      <div
        className="modal fade"
        id="tagModal"
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
              ADD RELEASE TAG
            </div>

            <div className="modal-body px-5 pb-4">
              <form onSubmit={props.handleSubmit}>
                <div className="row mb-2">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="tag">Tag</label>
                      <input
                        type="text"
                        className={`form-control ${inputdark}`}
                        placeholder="A comma-separated list of tags."
                        name="tag"
                        id="tag"
                        value={tag}
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
                    {props.loading ? <Loader size={25} /> : "Add"}
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

ReleaseTagModal.propTypes = {
  handleSubmit: PropTypes.func,
  handleChange: PropTypes.func,
  fieldData: PropTypes.object,
};

export default ReleaseTagModal;
