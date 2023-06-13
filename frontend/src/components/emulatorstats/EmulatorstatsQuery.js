import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import { InputFormControl } from "components/styled";
import {
  extractDateFromString,
  handleSelectFactory,
  paramsToObject,
  pushState,
  selectDarkStyles,
  timeStampFormat,
  transformTagsOptions,
} from "utils/utils";
import { queryEmulatorstats } from "features/emulatorstats/emulatorstatsSlice";
import { PushStateEnum, THEME_MODES } from "features/base/constants";

function EmulatorstatsQuery(props) {
  const [fieldData, setFieldData] = useState({
    uuid: "",
    runner: "",
    branch: "",
    limit: 10,
    start_time: "",
    end_time: "",
  });
  const [selectedTag, setSelectedTag] = useState(null);
  const { tags } = useSelector((state) => state.emulatorstats);
  const { theme } = useSelector((state) => state.home);
  const dispatch = useDispatch();
  const { search } = useLocation();
  const navigate = useNavigate();

  const tagOptions = transformTagsOptions(tags);
  const handleTagSelect = handleSelectFactory(setSelectedTag);

  useEffect(() => {
    const paramsObj = paramsToObject(search);
    if (paramsObj.uuid) {
      setFieldData((current) => {
        return { ...current, uuid: paramsObj.uuid };
      });
    }
    if (paramsObj.runner) {
      setFieldData((current) => {
        return { ...current, runner: paramsObj.runner };
      });
    }
    if (paramsObj.branch) {
      setFieldData((current) => {
        return { ...current, branch: paramsObj.branch };
      });
    }
    if (paramsObj.limit) {
      setFieldData((current) => {
        return { ...current, limit: paramsObj.limit };
      });
    }
    if (paramsObj.tags) {
      const mapTags = paramsObj.tags.split(",").map((x) => {
        return { label: x, value: x };
      });
      setSelectedTag((current) => mapTags);
    }
    if (paramsObj.start_time) {
      setFieldData((current) => {
        return { ...current, start_time: paramsObj.start_time };
      });
    }
    if (paramsObj.end_time) {
      setFieldData((current) => {
        return { ...current, end_time: paramsObj.end_time };
      });
    }
  }, [search]);

  const handleFieldChange = (e) => {
    setFieldData((current) => {
      return { ...current, [e.target.name]: e.target.value };
    });
  };

  const buildQueryObj = () => {
    const queryObj = {};
    if (fieldData.uuid) {
      queryObj["uuid"] = fieldData.uuid;
    }
    if (fieldData.runner) {
      queryObj["runner"] = fieldData.runner;
    }
    if (fieldData.branch) {
      queryObj["branch"] = fieldData.branch;
    }
    if (fieldData.limit) {
      queryObj["limit"] = fieldData.limit;
    }
    if (selectedTag && selectedTag.length > 0) {
      queryObj["tags"] = selectedTag.map((x) => x.value);
    }
    if (fieldData.start_time) {
      queryObj["start_time"] = timeStampFormat(
        extractDateFromString(fieldData.start_time)
      );
    }
    if (fieldData.end_time) {
      queryObj["end_time"] = timeStampFormat(
        extractDateFromString(fieldData.end_time)
      );
    }
    return queryObj;
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    const queryObj = buildQueryObj();
    dispatch(queryEmulatorstats(queryObj));
    pushState(queryObj, PushStateEnum.EMULATORSTATS);
  };

  const handleEmustatsChart = () => {
    const queryObj = buildQueryObj();
    const params = new URLSearchParams(queryObj);
    let url = `/emucharts?${params.toString()}`;
    navigate(url);
  };

  const customStyles = theme === THEME_MODES.DARK_THEME ? selectDarkStyles : {};

  return (
    <>
      <form onSubmit={handleQuerySubmit} data-testid="query-form">
        <div className="row mb-2">
          <div className="col-md">
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
        </div>
        <div className="row mb-2">
          <div className="col-md">
            <div className="form-group">
              <label htmlFor="runner">Runner</label>
              <InputFormControl
                type="text"
                name="runner"
                id="runner"
                value={fieldData.runner}
                theme={theme}
                onChange={handleFieldChange}
                placeholder="SBdevRunner"
              />
            </div>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-md">
            <div className="form-group">
              <label htmlFor="branch">Branch</label>
              <InputFormControl
                type="text"
                name="branch"
                id="branch"
                value={fieldData.branch}
                theme={theme}
                onChange={handleFieldChange}
                placeholder="upload_emu_stats"
              />
            </div>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <Select
                isSearchable
                isClearable
                isMulti
                placeholder="Invalid"
                options={tagOptions}
                name="tags"
                inputId="tags"
                onChange={handleTagSelect}
                defaultValue={selectedTag}
                value={selectedTag}
                className="multi-select-container"
                classNamePrefix="select"
                styles={customStyles}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="limit">Limit</label>
              <InputFormControl
                type="number"
                name="limit"
                id="limit"
                value={fieldData.limit}
                theme={theme}
                onChange={handleFieldChange}
              />
            </div>
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="start_time">Start Time</label>
              <InputFormControl
                type="text"
                name="start_time"
                id="start_time"
                value={fieldData.start_time}
                onChange={handleFieldChange}
                placeholder="YYYYMMDDHHmmSS"
                theme={theme}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="end_time">End Time</label>
              <InputFormControl
                type="text"
                name="end_time"
                id="end_time"
                value={fieldData.end_time}
                onChange={handleFieldChange}
                placeholder="YYYYMMDDHHmmSS"
                theme={theme}
              />
            </div>
          </div>
        </div>
        <div className="form-group mb-4">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
          <button
            type="button"
            className="btn btn-primary mx-2"
            onClick={handleEmustatsChart}
          >
            Generate Chart
          </button>
        </div>
      </form>
    </>
  );
}

EmulatorstatsQuery.propTypes = {};

export default EmulatorstatsQuery;
