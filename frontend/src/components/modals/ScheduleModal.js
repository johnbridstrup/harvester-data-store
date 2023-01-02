import PropTypes from "prop-types";
import Select from "react-select";
import { Loader } from "utils/utils";

function ScheduleModal(props) {
  return (
    <div className="col-md-8">
      <div
        className="modal fade"
        id="scheduleModal"
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
                        onChange={props.handleHarvIdSelect}
                        defaultValue={props.selectedHarvId}
                        value={props.selectedHarvId}
                        className="multi-select-container"
                        classNamePrefix="select"
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
};

export default ScheduleModal;
