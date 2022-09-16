import PropTypes from "prop-types";
import Select from "react-select";
import { Loader } from "../../utils/utils";

function HarvesterModal(props) {
  const { name, harv_id } = props.fieldData;
  return (
    <div className="col-md-8">
      <div
        className="modal fade"
        id="harvesterModal"
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
              ADD NEW HARVESTER
            </div>

            <div className="modal-body px-5 pb-4">
              <form onSubmit={props.handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={name}
                        onChange={props.handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="harv_id">Harv ID</label>
                      <input
                        type="text"
                        className="form-control"
                        name="harv_id"
                        value={harv_id}
                        onChange={props.handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="fruit">Fruit</label>
                      <Select
                        isSearchable
                        placeholder="strawberry"
                        options={props.fruitOptions}
                        name="fruit"
                        onChange={props.handleFruitSelect}
                        defaultValue={props.selectedFruit}
                        value={props.selectedFruit}
                        className="multi-select-container"
                        classNamePrefix="select"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="location">Location</label>
                      <Select
                        isSearchable
                        placeholder="location"
                        options={props.locOptions}
                        name="fruit"
                        onChange={props.handleLocSelect}
                        defaultValue={props.selectedLoc}
                        value={props.selectedLoc}
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
                    {props.loading ? <Loader size={25} /> : "ADD"}
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

HarvesterModal.propTypes = {
  handleChange: PropTypes.func,
  fieldData: PropTypes.object,
  handleSubmit: PropTypes.func,
  loading: PropTypes.bool,
  fruitOptions: PropTypes.array,
  selectedFruit: PropTypes.array,
  handleFruitSelect: PropTypes.func,
  locOptions: PropTypes.array,
  handleLocSelect: PropTypes.func,
  selectedLoc: PropTypes.array,
};

export default HarvesterModal;
