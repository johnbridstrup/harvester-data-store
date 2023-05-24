import moment from "moment";
import PropTypes from "prop-types";
import Select from "react-select";
import { Link } from "react-router-dom";
import { InputFormControl } from "components/styled";
import { darkThemeClass, selectDarkStyles } from "utils/utils";

export const FormQuery = (props) => {
  const {
    theme,
    label,
    fieldData,
    handleSubmit,
    handleFieldChange,
    harvesterOptions,
    handleHarvestSelect,
    selectedHarvId,
    locationOptions,
    handleLocationSelect,
    selectedLocation,
    tagOptions,
    handleTagSelect,
    selectedTag,
  } = props;
  const PICKSESSION = "PickSession";
  const dark = darkThemeClass("dark-theme", theme);
  const customStyles = dark ? selectDarkStyles : {};

  return (
    <form onSubmit={handleSubmit} data-testid="query-form">
      {label === PICKSESSION && (
        <>
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="harv_ids">Harv IDS</label>
                <Select
                  isMulti
                  isSearchable
                  placeholder="1,2,3,..."
                  options={harvesterOptions}
                  name="harv_ids"
                  inputId="harv_ids"
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
                  inputId="locations"
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
            <div className="col-md-6">
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
          </div>
          <div className="row mb-4">
            <div className="col">
              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <Select
                  isMulti
                  isSearchable
                  placeholder="completed, errorreport, ..."
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
          </div>
        </>
      )}
      <div className="form-group">
        <label htmlFor="uuid">{label}</label>
        <InputFormControl
          type="text"
          name="uuid"
          id="uuid"
          value={fieldData?.uuid}
          theme={theme}
          onChange={handleFieldChange}
          placeholder="68b3aab6-24c9-11ed-bb17-f9799c718175"
        />
      </div>
      <div className="text-center mt-3">
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </div>
    </form>
  );
};

export const GenericEvent = (props) => {
  const tabledt = darkThemeClass("dt-table", props.theme);
  return (
    <div className="table-responsive">
      <table className={`table ${tabledt}`}>
        <thead>
          <tr>
            <th>ID</th>
            <th>UUID</th>
            <th>Related Objects</th>
            <th>Related Files</th>
            <th>Created At</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {props.data.map((obj, _) => (
            <tr key={obj.id}>
              <td>{obj.id}</td>
              <td>
                <Link to={`/${props.link}/${obj.id}`}>{obj.UUID}</Link>
              </td>
              <td>
                {obj.related_objects?.map((obj, index) => (
                  <div key={index}>
                    <Link to={obj.url}>{obj.object}</Link>
                  </div>
                ))}
              </td>
              <td>
                {obj.related_files?.map((obj, index) => (
                  <div key={index}>
                    <a href="#!" onClick={() => props.handleDownload(obj)}>
                      {obj.filetype}
                    </a>
                  </div>
                ))}
              </td>
              <td>{moment(obj.createdAt).format("LLLL")}</td>
              <td>{moment(obj.lastModified).format("LLLL")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

FormQuery.propTypes = {
  handleSubmit: PropTypes.func,
  handleFieldChange: PropTypes.func,
  label: PropTypes.string,
  theme: PropTypes.string,
  harvesterOptions: PropTypes.array,
  handleHarvestSelect: PropTypes.func,
  selectedHarvId: PropTypes.array,
  locationOptions: PropTypes.array,
  handleLocationSelect: PropTypes.func,
  selectedLocation: PropTypes.array,
  fieldData: PropTypes.object,
  tagOptions: PropTypes.array,
  handleTagSelect: PropTypes.func,
  selectedTag: PropTypes.array,
};

GenericEvent.propTypes = {
  data: PropTypes.array,
  link: PropTypes.string,
  handleDownload: PropTypes.func,
  theme: PropTypes.string,
};
