import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { useLocation } from "react-router-dom";
import { queryJobs } from "features/harvjobs/harvjobSlice";
import {
  transformHarvOptions,
  statusOptions,
  selectDarkStyles,
  pushState,
  paramsToObject,
} from "utils/utils";
import { InputFormControl } from "components/styled";
import { PushStateEnum, THEME_MODES } from "features/base/constants";

function JobQuery(props) {
  const [fieldData, setFieldData] = useState({
    uuid: "",
  });
  const [selectedHarvId, setSelectedHarvId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const { harvesters } = useSelector((state) => state.harvester);
  const { theme } = useSelector((state) => state.home);
  const harvesterOptions = transformHarvOptions(harvesters);
  const dispatch = useDispatch();
  const { search } = useLocation();

  useEffect(() => {
    const paramsObj = paramsToObject(search);
    if (paramsObj.event__UUID) {
      setFieldData((current) => {
        return { ...current, uuid: paramsObj.event__UUID };
      });
    }
    if (paramsObj.target__harv_id) {
      let harv_id = {
        label: paramsObj.target__harv_id,
        value: paramsObj.target__harv_id,
      };
      setSelectedHarvId((current) => harv_id);
    }
    if (paramsObj.jobstatus) {
      let jobstatus = {
        label: paramsObj.jobstatus,
        value: paramsObj.jobstatus,
      };
      setSelectedStatus((current) => jobstatus);
    }
  }, [search]);

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };

  const handleHarvestSelect = (newValue, actionMeta) => {
    setSelectedHarvId((current) => newValue);
  };

  const handleStatusSelect = (newValue, actionMeta) => {
    setSelectedStatus((current) => newValue);
  };

  const handleFormQuerySubmit = async (e) => {
    e.preventDefault();
    const queryObj = {};

    if (fieldData.uuid) {
      queryObj["event__UUID"] = fieldData.uuid;
    }
    if (selectedHarvId && selectedHarvId.hasOwnProperty("value")) {
      queryObj["target__harv_id"] = selectedHarvId.value;
    }
    if (selectedStatus && selectedStatus.hasOwnProperty("value")) {
      queryObj["jobstatus"] = selectedStatus.value;
    }

    dispatch(queryJobs(queryObj));
    pushState(queryObj, PushStateEnum.JOBS);
  };

  const customStyles = theme === THEME_MODES.DARK_THEME ? selectDarkStyles : {};

  return (
    <form onSubmit={handleFormQuerySubmit}>
      <div className="row mb-4">
        <div className="col">
          <div className="form-group">
            <label>UUID</label>
            <InputFormControl
              type="text"
              name="uuid"
              id="uuid"
              theme={theme}
              value={fieldData.uuid}
              onChange={handleFieldChange}
              placeholder="ee402ab2-5627-11ed-ab3a-75f85fa65d8d"
            />
          </div>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col">
          <div className="form-group">
            <label>Harv ID</label>
            <Select
              isSearchable
              isClearable
              placeholder="11"
              options={harvesterOptions}
              name="harv_id"
              id="harv_id"
              onChange={handleHarvestSelect}
              defaultValue={selectedHarvId}
              value={selectedHarvId}
              className="multi-select-container"
              classNamePrefix="select"
              styles={customStyles}
            />
          </div>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col">
          <div className="form-group">
            <label>Job Status</label>
            <Select
              isSearchable
              isClearable
              placeholder="Success"
              options={statusOptions}
              name="jobstatus"
              id="jobstatus"
              onChange={handleStatusSelect}
              defaultValue={selectedStatus}
              value={selectedStatus}
              className="multi-select-container"
              classNamePrefix="select"
              styles={customStyles}
            />
          </div>
        </div>
      </div>
      <div className="mb-4">
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </div>
    </form>
  );
}

JobQuery.propTypes = {};

export default JobQuery;
