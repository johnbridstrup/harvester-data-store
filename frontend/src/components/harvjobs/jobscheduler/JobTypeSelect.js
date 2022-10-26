import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Select from "react-select";

function JobTypeSelect(props) {
  return (
    <div className="job-type-select">
      <Select
        isSearchable
        isClearable
        placeholder="select job type"
        options={props.jobtypeOptions}
        name="jobtype"
        onChange={props.handleJobTypeSelect}
        defaultValue={props.selectedJobType}
        value={props.selectedJobType}
        className="multi-select-container"
        classNamePrefix="select"
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
};

export default JobTypeSelect;
