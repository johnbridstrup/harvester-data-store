import { useNavigate } from "react-router-dom";
import { InputFormControl } from "../styled";
import PropTypes from "prop-types";
import Select from "react-select";
import { aggregateOptions } from "../../utils/utils";

export const HoverTabular = (props) => {
  return (
    <>
      {props.hoverObj?.type === "HARVESTER" && (
        <div>
          <div className="d-flex">
            <div className="tabular bg-gray">Property</div>
            <div className="tabular bg-gray">Value</div>
          </div>
          <div className="d-flex">
            <div className="tabular">Harv ID</div>
            <div className="tabular">{props.hoverObj?.obj?.harv_id}</div>
          </div>
          <div className="d-flex">
            <div className="tabular">Name</div>
            <div className="tabular">{props.hoverObj?.obj?.name}</div>
          </div>
          <div className="d-flex">
            <div className="tabular">Fruit</div>
            <div className="tabular">{props.hoverObj?.obj?.fruit?.name}</div>
          </div>
          <div className="d-flex">
            <div className="tabular">Location</div>
            <div className="tabular">
              {props.hoverObj?.obj?.location?.ranch}
            </div>
          </div>
        </div>
      )}

      {props.hoverObj?.type === "LOCATION" && (
        <div>
          <div className="d-flex">
            <div className="tabular bg-gray">Property</div>
            <div className="tabular bg-gray">Value</div>
          </div>
          <div className="d-flex">
            <div className="tabular">Ranch</div>
            <div className="tabular">{props.hoverObj?.obj?.ranch}</div>
          </div>
          <div className="d-flex">
            <div className="tabular">Country</div>
            <div className="tabular">{props.hoverObj?.obj?.country}</div>
          </div>
          <div className="d-flex">
            <div className="tabular">Region</div>
            <div className="tabular">{props.hoverObj?.obj?.region}</div>
          </div>
          <div className="d-flex">
            <div className="tabular">Location</div>
            <div className="tabular">
              {props.hoverObj?.obj?.distributor?.name}
            </div>
          </div>
        </div>
      )}

      {props.hoverObj?.type === "CODE" && (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ background: "#f4f4f4", border: "1px solid #ccc" }}>
                  Code
                </th>
                <th style={{ background: "#f4f4f4", border: "1px solid #ccc" }}>
                  Exception
                </th>
                <th style={{ background: "#f4f4f4", border: "1px solid #ccc" }}>
                  Service
                </th>
              </tr>
            </thead>
            <tbody>
              {props.hoverObj?.obj?.map((obj, _) => (
                <tr key={obj.id}>
                  <td>{obj.code?.code}</td>
                  <td>{obj.code?.name}</td>
                  <td>
                    {obj.service}.{obj.robot}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <small>
        ** <b>Note</b> If you hover over (harvester) (location) and (code).
        Extra information will appear here **
      </small>
    </>
  );
};

export const ExceptTabular = (props) => {
  return (
    <div>
      <div className="d-flex">
        <div className="tabular bg-gray">Exception</div>
        <div className="tabular bg-gray">Timestamp</div>
      </div>
      {
        <div className="d-flex">
          <div className="tabular">{props.exceptName}</div>
          <div className="tabular">{props.timestamp}</div>
        </div>
      }
    </div>
  );
};

export const ParetoForm = (props) => {
  return (
    <div className="mb-4">
      <form onSubmit={props.handleSubmit}>
        <div className="row mb-3">
          <div className="col">
            <div className="form-group">
              <label htmlFor="aggregate_query">Group By</label>
              <Select
                isSearchable
                isClearable
                placeholder="code__name"
                options={aggregateOptions}
                name="aggregate_query"
                onChange={props.handleChange}
                defaultValue={props.selectedAggregate}
                value={props.selectedAggregate}
                className="multi-select-container"
                classNamePrefix="select"
              />
            </div>
          </div>
        </div>
        <div className="text-center ">
          <button type="submit" className="btn btn-primary">
            Build Chart
          </button>
        </div>
      </form>
    </div>
  );
};

export const ParetoTabular = (props) => {
  return (
    <div>
      <div className="d-flex">
        <div className="tabular bg-gray">Property</div>
        <div className="tabular bg-gray">Value</div>
      </div>
      {props.paramsObj?.harv_ids && (
        <div className="d-flex">
          <div className="tabular">harv_ids</div>
          <div className="tabular">{props.paramsObj.harv_ids}</div>
        </div>
      )}
      {props.paramsObj?.locations && (
        <div className="d-flex">
          <div className="tabular">locations</div>
          <div className="tabular">{props.paramsObj.locations}</div>
        </div>
      )}
      {props.paramsObj?.fruits && (
        <div className="d-flex">
          <div className="tabular">fruits</div>
          <div className="tabular">{props.paramsObj.fruits}</div>
        </div>
      )}
      {props.paramsObj?.codes && (
        <div className="d-flex">
          <div className="tabular">codes</div>
          <div className="tabular">{props.paramsObj.codes}</div>
        </div>
      )}
      {props.paramsObj?.traceback && (
        <div className="d-flex">
          <div className="tabular">traceback</div>
          <div className="tabular">{props.paramsObj.traceback}</div>
        </div>
      )}
      {props.paramsObj?.tz && (
        <div className="d-flex">
          <div className="tabular">Timezone</div>
          <div className="tabular">{props.paramsObj.tz}</div>
        </div>
      )}
      {props.paramsObj?.start_time && (
        <div className="d-flex">
          <div className="tabular">start_time</div>
          <div className="tabular">{props.paramsObj.start_time}</div>
        </div>
      )}
      {props.paramsObj?.end_time && (
        <div className="d-flex">
          <div className="tabular">end_time</div>
          <div className="tabular">{props.paramsObj.end_time}</div>
        </div>
      )}
      {props.paramsObj?.generic && (
        <div className="d-flex">
          <div className="tabular">Generics</div>
          <div className="tabular">{props.paramsObj.generic}</div>
        </div>
      )}
    </div>
  );
};

export const BackButton = (props) => {
  const navigate = useNavigate();
  const goBack = () => {
    let params = new URLSearchParams(props.paramsObj);
    navigate(`/errorreports/?${params.toString()}`);
  };
  return (
    <div className="mt-4 mb-4">
      <span className="btn btn-default" onClick={goBack}>
        <i className="las la-arrow-left"></i> Back
      </span>
    </div>
  );
};

export const FormQuery = (props) => {
  const {
    handleFormQuerySubmit,
    harvesterOptions,
    handleHarvestSelect,
    selectedHarvId,
    locationOptions,
    handleLocationSelect,
    selectedLocation,
    fruitOptions,
    handleFruitSelect,
    selectedFruit,
    codeOptions,
    handleCodeSelect,
    selectedCode,
    timezoneOptions,
    handleTimezoneSelect,
    selectedTimezone,
    handleGenPareto,
    handleModalPopUp,
    notifyRef,
    fieldData,
    handleFieldChange,
  } = props;
  return (
    <form onSubmit={handleFormQuerySubmit}>
      <div className="row mb-4 mt-2">
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="harv_ids">Harv IDS</label>
            <Select
              isMulti
              isSearchable
              placeholder="1,2,3,..."
              options={harvesterOptions}
              name="harv_ids"
              onChange={handleHarvestSelect}
              value={selectedHarvId}
              defaultValue={selectedHarvId}
              className="multi-select-container"
              classNamePrefix="select"
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="locations">Ranches</label>
            <Select
              isMulti
              isSearchable
              placeholder="ranch1, ranch2, ..."
              options={locationOptions}
              name="locations"
              onChange={handleLocationSelect}
              defaultValue={selectedLocation}
              value={selectedLocation}
              className="multi-select-container"
              classNamePrefix="select"
            />
          </div>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="fruit">Fruit</label>
            <Select
              isMulti
              isSearchable
              placeholder="strawberry"
              options={fruitOptions}
              name="fruit"
              onChange={handleFruitSelect}
              defaultValue={selectedFruit}
              value={selectedFruit}
              className="multi-select-container"
              classNamePrefix="select"
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="code">Code</label>
            <Select
              isMulti
              isSearchable
              placeholder="1,2,3,..."
              options={codeOptions}
              name="code"
              onChange={handleCodeSelect}
              defaultValue={selectedCode}
              value={selectedCode}
              className="multi-select-container"
              classNamePrefix="select"
            />
          </div>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="traceback">Traceback</label>
            <InputFormControl
              type="text"
              name="traceback"
              value={fieldData.traceback}
              onChange={handleFieldChange}
              placeholder="traceback string"
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="generic">Generic LookUp</label>
            <InputFormControl
              type="text"
              name="generic"
              value={fieldData.generic}
              onChange={handleFieldChange}
              placeholder="field__lookup=x, column_lookup=y"
            />
          </div>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="form-check">
            <label htmlFor="emulator">Emulator</label>
            <input
              type="radio"
              name="is_emulator"
              value="1"
              checked={fieldData.is_emulator === "1"}
              onChange={handleFieldChange}
              className="form-check-input"
            />
          </div>
          <div className="form-check">
            <label htmlFor="emulator">Harvesters</label>
            <input
              type="radio"
              name="is_emulator"
              value="0"
              checked={fieldData.is_emulator === "0"}
              onChange={handleFieldChange}
              className="form-check-input"
            />
          </div>
          <div className="form-check">
            <label htmlFor="emulator">All</label>
            <input
              type="radio"
              name="is_emulator"
              value=""
              checked={fieldData.is_emulator === ""}
              onChange={handleFieldChange}
              className="form-check-input"
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-check">
            <label htmlFor="handled">Handled</label>
            <input
              type="radio"
              name="handled"
              value="1"
              checked={fieldData.handled === "1"}
              onChange={handleFieldChange}
              className="form-check-input"
            />
          </div>
          <div className="form-check">
            <label htmlFor="handled">Unhandled</label>
            <input
              type="radio"
              name="handled"
              value="0"
              checked={fieldData.handled === "0"}
              onChange={handleFieldChange}
              className="form-check-input"
            />
          </div>
          <div className="form-check">
            <label htmlFor="handled">All</label>
            <input
              type="radio"
              name="handled"
              value=""
              checked={fieldData.handled === ""}
              onChange={handleFieldChange}
              className="form-check-input"
            />
          </div>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="start_time">Start Time</label>
            <InputFormControl
              type="text"
              name="start_time"
              value={fieldData.start_time}
              onChange={handleFieldChange}
              placeholder="YYYYMMDDHHmmSS"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="end_time">End Time</label>
            <InputFormControl
              type="text"
              name="end_time"
              value={fieldData.end_time}
              onChange={handleFieldChange}
              placeholder="YYYYMMDDHHmmSS"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="tz">Timezone</label>
            <Select
              isSearchable
              placeholder="US/Pacific"
              options={timezoneOptions}
              name="tz"
              onChange={handleTimezoneSelect}
              defaultValue={selectedTimezone}
              value={selectedTimezone}
              className="multi-select-container"
              classNamePrefix="select"
            />
          </div>
        </div>
      </div>
      <div className="form-group">
        <button type="submit" className="btn btn-primary btn-md">
          Submit
        </button>
        <button
          type="button"
          onClick={handleGenPareto}
          className="btn btn-primary btn-md mx-2"
        >
          Generate Pareto
        </button>
        <button
          onClick={handleModalPopUp}
          type="button"
          className="btn btn-primary"
        >
          Create Notification
        </button>
        <button
          ref={notifyRef}
          type="button"
          data-bs-toggle="modal"
          data-bs-target="#notificationModal"
          style={{ display: "none" }}
        >
          Create Notification
        </button>
      </div>
    </form>
  );
};

HoverTabular.propTypes = {
  hoverObj: PropTypes.object,
};

ExceptTabular.propTypes = {
  exceptName: PropTypes.string,
  timestamp: PropTypes.string,
};

ParetoForm.propTypes = {
  handleChange: PropTypes.func,
  handleSubmit: PropTypes.func,
  selectedAggregate: PropTypes.object,
};

ParetoTabular.propTypes = {
  paramsObj: PropTypes.object,
};

BackButton.propTypes = {
  paramsObj: PropTypes.object,
};

FormQuery.propTypes = {
  handleFormQuerySubmit: PropTypes.func,
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
  selectedTimezone: PropTypes.array,
  handleGenPareto: PropTypes.func,
  handleModalPopUp: PropTypes.func,
  notifyRef: PropTypes.object,
  fieldData: PropTypes.object,
  handleFieldChange: PropTypes.func,
};
