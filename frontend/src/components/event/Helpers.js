import moment from "moment";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { InputFormControl } from "components/styled";
import { darkThemeClass } from "utils/utils";

export const FormQuery = (props) => {
  return (
    <form onSubmit={props.handleSubmit}>
      <div className="form-group">
        <label htmlFor="uuid">{props.label}</label>
        <InputFormControl
          type="text"
          name="uuid"
          id="uuid"
          value={props.uuid}
          theme={props.theme}
          onChange={props.handleChange}
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
  handleChange: PropTypes.func,
  label: PropTypes.string,
  theme: PropTypes.string,
  uuid: PropTypes.string,
};

GenericEvent.propTypes = {
  data: PropTypes.array,
  link: PropTypes.string,
  handleDownload: PropTypes.func,
  theme: PropTypes.string,
};
