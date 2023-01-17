import PropTypes from "prop-types";
import Select from "react-select";
import { darkThemeClass, selectDarkStyles } from "utils/utils";

function NotificationModal(props) {
  const modal = darkThemeClass("dt-modal-content", props.theme);
  const customStyles = modal ? selectDarkStyles : {};
  return (
    <div className="col-md-8">
      <div
        className="modal fade"
        id="notificationModal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true"
        style={{ display: "none" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className={`modal-content ${modal}`}>
            <div
              className="text-right"
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <button
                type="button"
                className={`btn`}
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span className="las la-times"></span>
              </button>
            </div>
            <div className="modal-body text-center px-5 pb-2">
              CREATE NOTIFICATION
            </div>

            <div className="modal-body px-5 pb-4">
              <div className="form-group">
                <label htmlFor="recipients">Select Recipients</label>
                <Select
                  isMulti
                  isSearchable
                  placeholder="aft, noaft, ..."
                  options={props.usersOptions}
                  name="recipients"
                  onChange={props.handleRecipientSelect}
                  defaultValue={props.selectedRecipient}
                  value={props.selectedRecipient}
                  className="multi-select-container"
                  classNamePrefix="select"
                  styles={customStyles}
                />
              </div>
              <div className="form-group text-center mt-4 mb-4">
                <button
                  onClick={props.handleSubmit}
                  className="btn btn-primary"
                >
                  CREATE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

NotificationModal.propTypes = {
  usersOptions: PropTypes.array,
  handleRecipientSelect: PropTypes.func,
  selectedRecipient: PropTypes.array,
  handleSubmit: PropTypes.func,
  theme: PropTypes.string,
};

export default NotificationModal;
