import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Select from "react-select";
import { THEME_MODES } from "features/base/constants";
import { selectDarkStyles } from "utils/utils";

function JobTypeSelect(props) {
  const customStyles =
    props.theme === THEME_MODES.DARK_THEME ? selectDarkStyles : {};

  return (
    <div className="job-type-select">
      <Select
        isSearchable
        isClearable
        placeholder="select job type"
        options={props.jobtypeOptions}
        name="jobtype"
        id="jobtype"
        onChange={props.handleJobTypeSelect}
        defaultValue={props.selectedJobType}
        value={props.selectedJobType}
        className="multi-select-container"
        classNamePrefix="select"
        styles={customStyles}
      />
      <span className="add-new-link">
        <Link to={`/jobtypes`}>
          <i className="las la-plus"></i>
        </Link>
      </span>
    </div>
  );
}

JobTypeSelect.propTypes = {
  jobtypeOptions: PropTypes.array,
  handleJobTypeSelect: PropTypes.func,
  selectedJobType: PropTypes.object,
  theme: PropTypes.string,
};

export default JobTypeSelect;
