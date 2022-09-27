import { useNavigate } from "react-router-dom";
import {
  CodeServiceDiv,
  HoverDiv,
  HoverDivModal,
  InputFormControl,
  ToolBox,
} from "../styled";
import PropTypes from "prop-types";
import Select from "react-select";
import { aggregateOptions, getUniqueListBy } from "../../utils/utils";

export const DownloadButton = (props) => {
  return (
    <div className="flex-right mb-2">
      <span onClick={props.popUp} className="btn btn-default mx-2">
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
    </div>
  );
};

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
              {props.hoverObj?.obj?.map((obj, i) => (
                <tr key={i}>
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

export const HarvesterHover = (props) => {
  return (
    <HoverDiv position={props.position}>
      <ToolBox position={props.position}>
        <div>
          <span>Harv ID</span>:{" "}
          <span>
            <strong>{props.harvester.harv_id}</strong>
          </span>
        </div>
        <div>
          <span>Name</span>:{" "}
          <span>
            <strong>{props.harvester.name}</strong>
          </span>
        </div>
        <div>
          <span>Fruit</span>:{" "}
          <span>
            <strong>{props.harvester.fruit.name}</strong>
          </span>
        </div>
        <div>
          <span>Location</span>:{" "}
          <span>
            <strong>{props.harvester.location.ranch}</strong>
          </span>
        </div>
      </ToolBox>
    </HoverDiv>
  );
};

export const LocationHover = (props) => {
  return (
    <HoverDiv position={props.position}>
      <ToolBox position={props.position}>
        <div>
          <span>Ranch</span>:{" "}
          <span>
            <strong>{props.location.ranch}</strong>
          </span>
        </div>
        <div>
          <span>Country</span>:{" "}
          <span>
            <strong>{props.location.country}</strong>
          </span>
        </div>
        <div>
          <span>Region</span>:{" "}
          <span>
            <strong>{props.location.region}</strong>
          </span>
        </div>
        <div>
          <span>Distributer</span>:{" "}
          <span>
            <strong>{props.location.distributor.name}</strong>
          </span>
        </div>
      </ToolBox>
    </HoverDiv>
  );
};

export const CodeHover = (props) => {
  const exceptions = getUniqueListBy(props.exceptions, "code");
  return (
    <HoverDivModal position={props.position}>
      <ToolBox position={props.position}>
        {exceptions.map((excep, index) => (
          <CodeServiceDiv key={index}>
            <span>
              Code: <strong>{excep.code.code}</strong>
            </span>
            <span>
              Name: <strong>{excep.code.name}</strong>
            </span>
            <span>
              Message: <strong>{excep.code.msg}</strong>
            </span>
            <span>
              Team: <strong>{excep.code.team}</strong>
            </span>
            <span>
              Cycle: <strong>{excep.code.cycle ? "True" : "False"}</strong>
            </span>
          </CodeServiceDiv>
        ))}
      </ToolBox>
    </HoverDivModal>
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
    traceback,
    handleTracebackChange,
    generic,
    handleGenericChange,
    datesQuery,
    handleDateChange,
    timezoneOptions,
    handleTimezoneSelect,
    selectedTimezone,
    handleGenPareto,
    handleModalPopUp,
    notifyRef,
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
              value={traceback}
              onChange={handleTracebackChange}
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
              value={generic}
              onChange={handleGenericChange}
              placeholder="field__lookup=x, column_lookup=y"
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
              value={datesQuery.start_time}
              onChange={handleDateChange}
              placeholder="YYYYMMDDHHmmSS"
              maxLength={14}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="end_time">End Time</label>
            <InputFormControl
              type="text"
              name="end_time"
              value={datesQuery.end_time}
              onChange={handleDateChange}
              placeholder="YYYYMMDDHHmmSS"
              maxLength={14}
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

DownloadButton.propTypes = {
  popUp: PropTypes.func,
  downloadRef: PropTypes.object,
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

HarvesterHover.propTypes = {
  harvester: PropTypes.object,
  position: PropTypes.string,
};

LocationHover.propTypes = {
  location: PropTypes.object,
  position: PropTypes.string,
};

CodeHover.propTypes = {
  exceptions: PropTypes.array,
  position: PropTypes.string,
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
  traceback: PropTypes.string,
  handleTracebackChange: PropTypes.func,
  generic: PropTypes.string,
  handleGenericChange: PropTypes.func,
  datesQuery: PropTypes.object,
  handleDateChange: PropTypes.func,
  timezoneOptions: PropTypes.array,
  handleTimezoneSelect: PropTypes.func,
  selectedTimezone: PropTypes.array,
  handleGenPareto: PropTypes.func,
  handleModalPopUp: PropTypes.func,
  notifyRef: PropTypes.object,
};
