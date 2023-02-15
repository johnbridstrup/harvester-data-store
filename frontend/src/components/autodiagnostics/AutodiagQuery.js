import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { InputFormControl } from "components/styled";
import {
  handleSelectFactory,
  selectDarkStyles,
  transformHarvOptions,
  transformLocOptions,
} from "utils/utils";
import { queryAutodiagReport } from "features/autodiagnostics/autodiagnosticSlice";
import { THEME_MODES } from "features/base/constants";

function AutodiagQuery(props) {
  const [selectedHarvId, setSelectHarvId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [fieldData, setFieldData] = useState({
    uuid: "",
    robot: "",
    gripper_sn: "",
  });
  const { theme } = useSelector((state) => state.home);
  const { harvesters } = useSelector((state) => state.harvester);
  const { locations } = useSelector((state) => state.location);
  const dispatch = useDispatch();
  const harvesterOptions = transformHarvOptions(harvesters);
  const locationOptions = transformLocOptions(locations);
  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };
  const handleHarvestSelect = handleSelectFactory(setSelectHarvId);
  const handleLocationSelect = handleSelectFactory(setSelectedLocation);
  const customStyles = theme === THEME_MODES.DARK_THEME ? selectDarkStyles : {};

  const buildQueryObj = () => {
    let queryObj = {};
    if (selectedHarvId && selectedHarvId.hasOwnProperty("value")) {
      queryObj["harvester__harv_id"] = selectedHarvId.value;
    }
    if (selectedLocation && selectedLocation.hasOwnProperty("value")) {
      queryObj["location__ranch"] = selectedLocation.value;
    }
    if (fieldData.uuid) {
      queryObj["event__UUID"] = fieldData.uuid;
    }
    if (fieldData.gripper_sn) {
      queryObj["gripper_sn"] = fieldData.gripper_sn;
    }
    if (fieldData.robot) {
      queryObj["robot"] = fieldData.robot;
    }
    return queryObj;
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    let queryObj = buildQueryObj();
    console.log(queryObj);
    dispatch(queryAutodiagReport(queryObj));
  };

  return (
    <div className="mt-4 mb-4">
      <form onSubmit={handleQuerySubmit}>
        <div className="row mb-2">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="harv_ids">Harv IDS</label>
              <Select
                isSearchable
                isClearable
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
                isSearchable
                isClearable
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
        <div className="row mb-2">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="uuid">UUID</label>
              <InputFormControl
                type="text"
                name="uuid"
                id="uuid"
                value={fieldData.uuid}
                theme={theme}
                onChange={handleFieldChange}
                placeholder="77f6a03c-24c9-11ed-bb17-f9799c718175"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="robot">Robot</label>
              <InputFormControl
                type="number"
                name="robot"
                id="robot"
                value={fieldData.robot}
                theme={theme}
                onChange={handleFieldChange}
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <div className="row mb-3">
          <div className="col">
            <div className="form-group">
              <label htmlFor="gripper_sn">Gripper SN</label>
              <InputFormControl
                type="number"
                name="gripper_sn"
                id="gripper_sn"
                value={fieldData.gripper_sn}
                theme={theme}
                onChange={handleFieldChange}
                placeholder="1277"
              />
            </div>
          </div>
        </div>
        <div className="form-group text-center">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

AutodiagQuery.propTypes = {};

export default AutodiagQuery;
