import PropTypes from "prop-types";
import Select from "react-select";
import { Loader } from "utils/utils";

function LocationModal(props) {
  const { ranch, country, region, mode, siteChannel } = props.fieldData;
  return (
    <div className="col-md-8">
      <div
        className="modal fade"
        id="locationModal"
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
              {mode === "edit" ? "UPDATE" : "ADD NEW"} LOCATION
            </div>

            <div className="modal-body px-5 pb-4">
              <form onSubmit={props.handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="ranch">Ranch</label>
                      <input
                        type="text"
                        className="form-control"
                        name="ranch"
                        value={ranch}
                        required
                        onChange={props.handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <input
                        type="text"
                        className="form-control"
                        name="country"
                        value={country}
                        required
                        onChange={props.handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="region">Region</label>
                      <input
                        type="text"
                        className="form-control"
                        name="region"
                        value={region}
                        required
                        onChange={props.handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="distributor">Distributor</label>
                      <Select
                        isSearchable
                        isClearable
                        placeholder="distributor"
                        options={props.distributorOptions}
                        name="distributor"
                        onChange={props.handleDistrSelect}
                        defaultValue={props.selectedDistributor}
                        value={props.selectedDistributor}
                        className="multi-select-container"
                        classNamePrefix="select"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="siteChannel">Site Channel</label>
                      <input
                        type="text"
                        className="form-control"
                        name="siteChannel"
                        value={siteChannel}
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

LocationModal.propTypes = {
  handleChange: PropTypes.func,
  fieldData: PropTypes.object,
  handleSubmit: PropTypes.func,
  loading: PropTypes.bool,
  distributorOptions: PropTypes.array,
  selectedDistributor: PropTypes.object,
  handleDistrSelect: PropTypes.func,
};

export default LocationModal;
