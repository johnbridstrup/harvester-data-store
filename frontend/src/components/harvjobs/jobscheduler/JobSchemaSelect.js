import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";

function JobSchemaSelect(props) {
  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    if (props.selectedJobSchema) {
      navigate(`/schedulejob/${props.selectedJobSchema?.value}`);
    } else {
      toast.error("Please select a job type then job schema to proceed");
    }
  };
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
            onChange={props.handleJobSchemaSelect}
            defaultValue={props.selectedJobSchema}
            value={props.selectedJobSchema}
            className="multi-select-container"
            classNamePrefix="select"
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
};

export default JobSchemaSelect;
