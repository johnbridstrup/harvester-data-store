import PropTypes from "prop-types";
import { ModalForm } from "../errorreports/ErrorHelpers";
import { darkThemeClass } from "utils/utils";

function CreateNotifModal(props) {
  const modal = darkThemeClass("dt-modal-content", props.theme);
  return (
    <div className="col-md-8">
      <div
        className="modal fade"
        id="createNotifModal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="modal-center"
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
                aria-label="close"
              >
                <span
                  className={`las la-times ${modal && "text-white"}`}
                ></span>
              </button>
            </div>
            <div className="modal-body text-center px-5 pb-2">
              CREATE NOTIFICATION
            </div>

            <div className="modal-body px-5 pb-4">
              <ModalForm {...props} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

CreateNotifModal.propTypes = {
  usersOptions: PropTypes.array,
  handleRecipientSelect: PropTypes.func,
  selectedRecipient: PropTypes.array,
  handleSubmit: PropTypes.func,
  harvesterOptions: PropTypes.array,
  handleHarvestSelect: PropTypes.func,
  selectedHarvId: PropTypes.array,
  locationOptions: PropTypes.array,
  handleLocationSelect: PropTypes.func,
  selectedLocation: PropTypes.array,
  fruitOptions: PropTypes.array,
  handleFruitSelect: PropTypes.func,
  selectedFruit: PropTypes.array,
  codeOptions: PropTypes.array,
  handleCodeSelect: PropTypes.func,
  selectedCode: PropTypes.array,
  timezoneOptions: PropTypes.array,
  handleTimezoneSelect: PropTypes.func,
  selectedTimezone: PropTypes.object,
  fieldData: PropTypes.object,
  handleFieldChange: PropTypes.func,
  theme: PropTypes.string,
};

export default CreateNotifModal;
