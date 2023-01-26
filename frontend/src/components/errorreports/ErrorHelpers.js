import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Select from "react-select";
import { InputFormControl } from "../styled";
import {
  aggregateOptions,
  darkThemeClass,
  selectDarkStyles,
} from "utils/utils";

export const HoverTabular = (props) => {
  const bg = darkThemeClass("bg-dark", props.theme);
  const style = bg
    ? { border: "1px solid #ccc" }
    : { background: "#f4f4f4", border: "1px solid #ccc" };
  return (
    <>
      {props.hoverObj?.type === "HARVESTER" && (
        <div>
          <div className="d-flex">
            <div className={`tabular bg-gray ${bg}`}>Property</div>
            <div className={`tabular bg-gray ${bg}`}>Value</div>
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
            <div className={`tabular bg-gray ${bg}`}>Property</div>
            <div className={`tabular bg-gray ${bg}`}>Value</div>
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
          <table className={`table ${bg && "dt-table"}`}>
            <thead>
              <tr>
                <th style={style}>Code</th>
                <th style={style}>Exception</th>
                <th style={style}>Service</th>
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
  const bg = darkThemeClass("bg-dark", props.theme);
  return (
    <div className="mb-3">
      <div className="d-flex">
        <div className={`tabular bg-gray ${bg}`}>Exception</div>
        <div className={`tabular bg-gray ${bg}`}>Timestamp</div>
      </div>
      <div className="d-flex">
        <div className="tabular">{props.exceptName}</div>
        <div className="tabular">{props.timestamp}</div>
      </div>
    </div>
  );
};

export const ParetoTabular = (props) => {
  const bg = darkThemeClass("bg-dark", props.theme);
  return (
    <div>
      <div className="d-flex">
        <div className={`tabular bg-gray ${bg}`}>Property</div>
        <div className={`tabular bg-gray ${bg}`}>Value</div>
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
      {props.paramsObj?.is_emulator && (
        <div className="d-flex">
          <div className="tabular">Is Emulator</div>
          <div className="tabular">{props.paramsObj.is_emulator}</div>
        </div>
      )}
      {props.paramsObj?.handled && (
        <div className="d-flex">
          <div className="tabular">Handled</div>
          <div className="tabular">{props.paramsObj.handled}</div>
        </div>
      )}
      {props.paramsObj?.aggregate_query && (
        <div className="d-flex">
          <div className="tabular">Group By</div>
          <div className="tabular">{props.paramsObj.aggregate_query}</div>
        </div>
      )}
      {props.paramsObj?.exceptions__primary && (
        <div className="d-flex">
          <div className="tabular">Primary Only</div>
          <div className="tabular">{props.paramsObj.exceptions__primary}</div>
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
  const btn = darkThemeClass("btn-dark", props.theme);
  return (
    <div className="mt-4 mb-4">
      <span className={`btn btn-default ${btn}`} onClick={goBack}>
        <i className="las la-arrow-left"></i> Back
      </span>
    </div>
  );
};

export const GenericFormField = (props) => {
  const {
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
    fieldData,
    handleFieldChange,
    timezoneOptions,
    handleTimezoneSelect,
    selectedTimezone,
    theme,
  } = props;
  const dark = darkThemeClass("dark-theme", theme);
  const customStyles = dark ? selectDarkStyles : {};

  return (
    <>
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
              id="harv_ids"
              onChange={handleHarvestSelect}
              value={selectedHarvId}
              defaultValue={selectedHarvId}
              className="multi-select-container"
              classNamePrefix="select"
              styles={customStyles}
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
              id="locations"
              onChange={handleLocationSelect}
              defaultValue={selectedLocation}
              value={selectedLocation}
              className="multi-select-container"
              classNamePrefix="select"
              styles={customStyles}
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
              id="fruit"
              onChange={handleFruitSelect}
              defaultValue={selectedFruit}
              value={selectedFruit}
              className="multi-select-container"
              classNamePrefix="select"
              styles={customStyles}
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
              id="code"
              onChange={handleCodeSelect}
              defaultValue={selectedCode}
              value={selectedCode}
              className="multi-select-container"
              classNamePrefix="select"
              styles={customStyles}
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
              id="traceback"
              value={fieldData?.traceback}
              onChange={handleFieldChange}
              placeholder="traceback string"
              theme={theme}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="generic">Generic LookUp</label>
            <InputFormControl
              type="text"
              name="generic"
              id="generic"
              value={fieldData?.generic}
              onChange={handleFieldChange}
              placeholder="field__lookup=x, column_lookup=y"
              theme={theme}
            />
          </div>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="form-check">
            <label htmlFor="emulator_1">Emulator</label>
            <input
              type="radio"
              name="is_emulator"
              value="1"
              id="emulator_1"
              checked={fieldData?.is_emulator === "1"}
              onChange={handleFieldChange}
              className="form-check-input"
            />
          </div>
          <div className="form-check">
            <label htmlFor="emulator_0">Harvesters</label>
            <input
              type="radio"
              name="is_emulator"
              value="0"
              id="emulator_0"
              checked={fieldData?.is_emulator === "0"}
              onChange={handleFieldChange}
              className="form-check-input"
            />
          </div>
          <div className="form-check">
            <label htmlFor="emulator_all">All</label>
            <input
              type="radio"
              name="is_emulator"
              value=""
              id="emulator_all"
              checked={fieldData?.is_emulator === ""}
              onChange={handleFieldChange}
              className="form-check-input"
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-check">
            <label htmlFor="handled_1">Handled</label>
            <input
              type="radio"
              name="handled"
              value="1"
              id="handled_1"
              checked={fieldData?.handled === "1"}
              onChange={handleFieldChange}
              className="form-check-input"
            />
          </div>
          <div className="form-check">
            <label htmlFor="handled_0">Unhandled</label>
            <input
              type="radio"
              name="handled"
              value="0"
              id="handled_0"
              checked={fieldData?.handled === "0"}
              onChange={handleFieldChange}
              className="form-check-input"
            />
          </div>
          <div className="form-check">
            <label htmlFor="handled_all">All</label>
            <input
              type="radio"
              name="handled"
              value=""
              id="handled_all"
              checked={fieldData?.handled === ""}
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
              id="start_time"
              value={fieldData?.start_time}
              onChange={handleFieldChange}
              placeholder="YYYYMMDDHHmmSS"
              theme={theme}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="end_time">End Time</label>
            <InputFormControl
              type="text"
              name="end_time"
              id="end_time"
              value={fieldData?.end_time}
              onChange={handleFieldChange}
              placeholder="YYYYMMDDHHmmSS"
              theme={theme}
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
              id="tz"
              onChange={handleTimezoneSelect}
              defaultValue={selectedTimezone}
              value={selectedTimezone}
              className="multi-select-container"
              classNamePrefix="select"
              styles={customStyles}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export const ParetoForm = (props) => {
  const dark = darkThemeClass("dark-theme", props.theme);
  const customStyles = dark ? selectDarkStyles : {};
  return (
    <div className="mb-4">
      <form onSubmit={props.handleSubmit}>
        <GenericFormField {...props} />
        <div className="row mb-3">
          <div className="col">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="primary"
                name="primary"
                checked={props.fieldData?.primary}
                onChange={props.handleFieldChange}
              />
              <label className="form-check-label" htmlFor="primary">
                Primary Only
              </label>
            </div>
          </div>
        </div>
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
                id="aggregate_query"
                onChange={props.handleAggreSelect}
                defaultValue={props.selectedAggregate}
                value={props.selectedAggregate}
                className="multi-select-container"
                classNamePrefix="select"
                styles={customStyles}
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

export const FormQuery = (props) => {
  const {
    handleFormQuerySubmit,
    handleGenPareto,
    handleModalPopUp,
    notifyRef,
  } = props;
  return (
    <form onSubmit={handleFormQuerySubmit}>
      <GenericFormField {...props} />
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

export const RightButtonGroup = (props) => {
  const btn = darkThemeClass("btn-dark", props.theme);
  return (
    <div className="flex-right mb-2">
      <span
        onClick={props.createNotifPopUp}
        className={`btn btn-default mx-2 ${btn}`}
      >
        Create Notification
      </span>
      <span onClick={props.popUp} className={`btn btn-default mx-2 ${btn}`}>
        Get Files
      </span>
      <button
        ref={props.downloadRef}
        data-bs-toggle="modal"
        data-bs-target="#downloadModal"
        style={{ display: "none" }}
      >
        Get Files
      </button>
      <button
        ref={props.createNotifRef}
        data-bs-toggle="modal"
        data-bs-target="#createNotifModal"
        style={{ display: "none" }}
      >
        Create Notification
      </button>
    </div>
  );
};

HoverTabular.propTypes = {
  hoverObj: PropTypes.object,
  theme: PropTypes.string,
};

ExceptTabular.propTypes = {
  exceptName: PropTypes.string,
  timestamp: PropTypes.string,
  theme: PropTypes.string,
};

ParetoForm.propTypes = {
  handleAggreSelect: PropTypes.func,
  handleSubmit: PropTypes.func,
  selectedAggregate: PropTypes.object,
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
};

ParetoTabular.propTypes = {
  paramsObj: PropTypes.object,
  theme: PropTypes.string,
};

BackButton.propTypes = {
  paramsObj: PropTypes.object,
  theme: PropTypes.string,
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
  selectedTimezone: PropTypes.object,
  handleGenPareto: PropTypes.func,
  handleModalPopUp: PropTypes.func,
  notifyRef: PropTypes.object,
  fieldData: PropTypes.object,
  handleFieldChange: PropTypes.func,
  theme: PropTypes.string,
};

GenericFormField.propTypes = {
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

RightButtonGroup.propTypes = {
  popUp: PropTypes.func,
  downloadRef: PropTypes.object,
  createNotifRef: PropTypes.object,
  createNotifPopUp: PropTypes.func,
  theme: PropTypes.string,
};
