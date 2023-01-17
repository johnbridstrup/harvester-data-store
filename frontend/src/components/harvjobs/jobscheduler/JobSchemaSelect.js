import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";
import { THEME_MODES } from "features/base/constants";
import { selectDarkStyles } from "utils/utils";

function JobSchemaSelect(props) {
  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    if (props.selectedJobSchema) {
      navigate(`/schedulejob/${props.selectedJobSchema?.value}`);
    } else {
      toast.error("Please select a job type then job schema to proceed", {
        theme: props.theme === THEME_MODES.AUTO_THEME ? "colored" : props.theme,
      });
    }
  };
  const customStyles =
    props.theme === THEME_MODES.DARK_THEME ? selectDarkStyles : {};

  return (
    <div className="row mb-4">
      <div className="col-md-10">
        <div className="job-schema-select">
          <Select
            isSearchable
            isClearable
            placeholder="select schema"
            options={props.schemaOptions}
            name="jobschema"
            id="jobschema"
            onChange={props.handleJobSchemaSelect}
            defaultValue={props.selectedJobSchema}
            value={props.selectedJobSchema}
            className="multi-select-container"
            classNamePrefix="select"
            styles={customStyles}
          />
          <span className="add-new-link">
            <Link to={`/jobschemas`}>
              <i className="las la-plus"></i>
            </Link>
          </span>
        </div>
      </div>
      <div className="col-md-2">
        <Link
          to={`/schedulejob/${props.selectedJobSchema?.value}`}
          className="btn btn-primary"
          onClick={handleClick}
        >
          Schedule
        </Link>
      </div>
    </div>
  );
}

JobSchemaSelect.propTypes = {
  schemaOptions: PropTypes.array,
  handleJobSchemaSelect: PropTypes.func,
  selectedJobSchema: PropTypes.object,
  theme: PropTypes.string,
};

export default JobSchemaSelect;
