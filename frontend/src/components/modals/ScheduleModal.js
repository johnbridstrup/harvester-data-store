import PropTypes from "prop-types";
import Select from "react-select";
import { darkThemeClass, Loader, selectDarkStyles } from "utils/utils";

function ScheduleModal(props) {
  const modal = darkThemeClass("dt-modal-content", props.theme);
  const customStyles = modal ? selectDarkStyles : {};
  return (
    <div className="col-md-8">
      <div
        className="modal fade"
        id="scheduleModal"
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
              SCHEDULE DEPLOYMENT
            </div>

            <div className="modal-body px-5 pb-4">
              <form onSubmit={props.handleSubmit}>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="harv_id">Harv ID</label>
                      <Select
                        isSearchable
                        isClearable
                        placeholder="200"
                        options={props.harvOptions}
                        name="harv_id"
                        id="harv_id"
                        onChange={props.handleHarvIdSelect}
                        defaultValue={props.selectedHarvId}
                        value={props.selectedHarvId}
                        className="multi-select-container"
                        classNamePrefix="select"
                        styles={customStyles}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-block btn-primary mt-4 mb-4"
                  >
                    {props.loading ? <Loader size={25} /> : "Schedule"}
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

ScheduleModal.propTypes = {
  handleSubmit: PropTypes.func,
  loading: PropTypes.bool,
  harvOptions: PropTypes.array,
  selectedHarvId: PropTypes.object,
  handleHarvIdSelect: PropTypes.func,
  theme: PropTypes.string,
};

export default ScheduleModal;
