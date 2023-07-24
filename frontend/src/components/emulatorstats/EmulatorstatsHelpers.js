import { DataFrame } from "danfojs";
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

/**
 * Create and return a DataFrame
 * @param {Function} dateFunc
 * @param {Array} emustats
 * @returns
 */
export const createDataFrame = (dateFunc, emustats = []) => {
  const df = new DataFrame(emustats);
  const num_picks_col = df
    .column("num_pick_attempts")
    .mul(df.column("pick_success_percentage").div(100))
    .asType("int32");
  const num_grips_col = df
    .column("num_grip_attempts")
    .mul(df.column("grip_success_percentage").div(100))
    .asType("int32");
  const num_targets_col = num_picks_col
    .div(df.column("thoroughness_percentage").div(100))
    .asType("int32");
  const elapsed_hours_col = df.column("elapsed_seconds").div(3600);
  const report_time_col = df.column("reportTime").map((val) => dateFunc(val));

  df.addColumn("num_picks", num_picks_col, { inplace: true });
  df.addColumn("num_grips", num_grips_col, { inplace: true });
  df.addColumn("num_targets", num_targets_col, { inplace: true });
  df.addColumn("elapsed_hours", elapsed_hours_col, { inplace: true });
  df.addColumn("reportTime", report_time_col, { inplace: true });

  const picks_col = df.column("num_picks").div(df.column("elapsed_hours"));
  df.addColumn("picks_per_hour", picks_col, { inplace: true });

  return df;
};

EmustatsTabular.propTypes = {
  paramsObj: PropTypes.object,
};
