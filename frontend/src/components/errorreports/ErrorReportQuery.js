import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import {
  copiedUrl,
  extractDateFromString,
  timeStampFormat,
  transformCodeOptions,
  transformFruitOptions,
  transformHarvOptions,
  transformLocOptions,
  transformTzOptions,
  translateCodeOptions,
  translateHarvOptions,
  translateLocOptions,
} from "../../utils/utils";
import {
  copyQueryUrl,
  queryErrorReport,
  timezoneUpdate,
} from "../../features/errorreport/errorreportSlice";
import { DivTotalReport, InputFormControl } from "../styled";
import timezones from "../../utils/timezones";

function ErrorReportQuery(props) {
  const [selectedHarvId, setSelectedHarvId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTimezone, setSelectedTimezone] = useState(null);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [datesQuery, setDatesQuery] = useState({
    start_time: "",
    end_time: "",
  });
  const [traceback, setTraceback] = useState("");
  const count = useSelector((state) => state.errorreport.count);
  const { harvesters } = useSelector((state) => state.harvester);
  const { locations } = useSelector((state) => state.location);
  const { fruits } = useSelector((state) => state.fruit);
  const { exceptioncodes } = useSelector((state) => state.exceptioncode);
  const harvesterOptions = transformHarvOptions(harvesters);
  const locationOptions = transformLocOptions(locations);
  const timezoneOptions = transformTzOptions(timezones);
  const fruitOptions = transformFruitOptions(fruits);
  const codeOptions = transformCodeOptions(exceptioncodes);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleHarvestSelect = (newValue, actionMeta) => {
    setSelectedHarvId((current) => newValue);
  };

  const handleLocationSelect = (newValue, actionMeta) => {
    setSelectedLocation((current) => newValue);
  };

  const handleTimezoneSelect = (newValue, actionMeta) => {
    setSelectedTimezone((current) => newValue);
    dispatch(timezoneUpdate(newValue.value));
  };

  const handleFruitSelect = (newValue, actionMeta) => {
    setSelectedFruit((current) => newValue);
  };

  const handleCodeSelect = (newValue, actionMeta) => {
    setSelectedCode((current) => newValue);
  };

  const handleTracebackChange = (e) => {
    setTraceback(e.target.value);
  };

  const buildQueryObj = () => {
    let queryObj = {};
    if (datesQuery.start_time) {
      queryObj["start_time"] = timeStampFormat(
        extractDateFromString(datesQuery.start_time)
      );
    }
    if (datesQuery.end_time) {
      queryObj["end_time"] = timeStampFormat(
        extractDateFromString(datesQuery.end_time)
      );
    }
    if (selectedHarvId && selectedHarvId.length > 0) {
      queryObj["harv_ids"] = translateHarvOptions(selectedHarvId);
    }
    if (selectedLocation && selectedLocation.length > 0) {
      queryObj["locations"] = translateLocOptions(selectedLocation);
    }
    if (selectedTimezone && selectedTimezone.hasOwnProperty("value")) {
      queryObj["tz"] = selectedTimezone.value;
    }
    if (selectedFruit && selectedFruit.hasOwnProperty("value")) {
      queryObj["fruit"] = selectedFruit.value;
    }
    if (selectedCode && selectedCode.length > 0) {
      queryObj["codes"] = translateCodeOptions(selectedCode);
    }
    if (traceback) {
      queryObj["traceback"] = traceback;
    }
    return queryObj
  }

  const handleFormQuerySubmit = async (e) => {
    e.preventDefault();
    let queryObj = buildQueryObj();
    await dispatch(queryErrorReport(queryObj));
    dispatch(copyQueryUrl(copiedUrl(queryObj)));
  };

  const handleDateChange = (e) => {
    setDatesQuery((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };

  const handleGenPareto = async () => {
    let queryObj = buildQueryObj();
    let params = new URLSearchParams(queryObj);
    let routeto = `/errorreports/view/pareto/?${params.toString()}`;
    navigate(routeto);
  }

  return (
    <div className="row">
      <div className="col-lg-10 col-md-8 col-sm-12">
        <div>
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
                    isSearchable
                    placeholder="strawberry"
                    options={fruitOptions}
                    name="fruit"
                    onChange={handleFruitSelect}
                    defaultValue={selectedFruit}
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
              <button type="button" onClick={handleGenPareto} className="btn btn-primary btn-md mx-2">Generate Pareto</button>
            </div>
          </form>
        </div>
      </div>
      <div className="col-lg-2 col-md-4 col-sm-12">
        <DivTotalReport className="total-report">
          <span>Total Report</span>
          <span>{count}</span>
        </DivTotalReport>
      </div>
    </div>
  );
}

ErrorReportQuery.propTypes = {};

export default ErrorReportQuery;
