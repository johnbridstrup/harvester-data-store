import PropTypes from "prop-types";
import { darkThemeClass } from "utils/utils";

function ConfirmModal(props) {
  const modal = darkThemeClass("dt-modal-content", props.theme);
  return (
    <>
      <button
        ref={props.confirmRef}
        data-bs-toggle="modal"
        data-bs-target="#confirmModal"
        style={{ display: "none" }}
      >
        CONFIRM
      </button>
      <div className="col-md-8">
        <div
          className="modal fade"
          id="confirmModal"
          tabIndex={-1}
          role="dialog"
          aria-labelledby="modal-center"
          aria-hidden="true"
          style={{ display: "none" }}
          data-testid="confirmModal"
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
              <div className="modal-body text-center px-5 pb-2">CONFIRM</div>

              <div className="modal-body px-5 pb-4">
                <div>{props.msg}</div>
                <div className="text-center">
                  <button
                    onClick={props.confirmRequest}
                    className="btn btn-sm btn-danger"
                    type="button"
                    disabled={props.loading}
                  >
                    {props.loading ? "loading..." : "YES"}
                  </button>{" "}
                  <button
                    onClick={props.cancelRequest}
                    className="btn btn-sm btn-warning"
                    type="button"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

ConfirmModal.propTypes = {
  confirmRequest: PropTypes.func,
  cancelRequest: PropTypes.func,
  confirmRef: PropTypes.object,
  msg: PropTypes.string,
  loading: PropTypes.bool,
  theme: PropTypes.string,
};

export default ConfirmModal;
