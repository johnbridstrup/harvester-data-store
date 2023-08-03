import PropTypes from "prop-types";
import VSCodeEditor from "@monaco-editor/react";
import { darkThemeClass, monacoOptions } from "utils/utils";
import { THEME_MODES } from "features/base/constants";

function PayloadModal(props) {
  const modal = darkThemeClass("dt-modal-content", props.theme);

  return (
    <div className="col-md-8">
      <div
        className="modal fade"
        id="payloadModal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="modal-center"
        aria-hidden="true"
        style={{ display: "none" }}
        data-testid="jsonModal"
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
            <div className="modal-body text-center px-5 pb-2">JOB PAYLOAD</div>

            <div className="modal-body px-5 pb-4">
              <VSCodeEditor
                height={"40vh"}
                language="json"
                value={JSON.stringify(props.payload, null, 2)}
                theme={
                  props.theme === THEME_MODES.DARK_THEME ? "vs-dark" : "light"
                }
                options={{ ...monacoOptions, readOnly: true }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

PayloadModal.propTypes = {
  theme: PropTypes.string,
  payload: PropTypes.object,
};

export default PayloadModal;
