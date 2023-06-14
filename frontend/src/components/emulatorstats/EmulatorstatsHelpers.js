import PropTypes from "prop-types";
import { darkThemeClass } from "utils/utils";

export const EmustatsTabular = (props) => {
  const bg = darkThemeClass("bg-dark", props.theme);
  return (
    <div className="mb-4">
      <div>Parameters</div>
      <div className="d-flex">
        <div className={`tabular bg-gray ${bg}`}>Property</div>
        <div className={`tabular bg-gray ${bg}`}>Value</div>
      </div>
      {props.paramsObj?.uuid && (
        <div className="d-flex">
          <div className="tabular">UUID</div>
          <div className="tabular">{props.paramsObj.uuid}</div>
        </div>
      )}
      {props.paramsObj?.runner && (
        <div className="d-flex">
          <div className="tabular">Runner</div>
          <div className="tabular">{props.paramsObj.runner}</div>
        </div>
      )}
      {props.paramsObj?.branch && (
        <div className="d-flex">
          <div className="tabular">Branch</div>
          <div className="tabular">{props.paramsObj.branch}</div>
        </div>
      )}
      {props.paramsObj?.tags && (
        <div className="d-flex">
          <div className="tabular">Tags</div>
          <div className="tabular">{props.paramsObj.tags}</div>
        </div>
      )}
      {props.paramsObj?.start_time && (
        <div className="d-flex">
          <div className="tabular">Start Time</div>
          <div className="tabular">{props.paramsObj.start_time}</div>
        </div>
      )}
      {props.paramsObj?.end_time && (
        <div className="d-flex">
          <div className="tabular">End Time</div>
          <div className="tabular">{props.paramsObj.end_time}</div>
        </div>
      )}
    </div>
  );
};

EmustatsTabular.propTypes = {
  paramsObj: PropTypes.object,
};
