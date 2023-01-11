import PropTypes from "prop-types";
import { useMemo } from "react";
import { LOG_LEVEL } from "features/base/constants";
import { logContent } from "utils/utils";

export const LogHighlighter = (props) => {
  const { logIndex, log, handleClick, className } = props;
  const logObj = useMemo(() => logContent(log.log_message), [log.log_message]);
  let levelClassName =
    logObj.log_level === LOG_LEVEL.DEBUG
      ? "text-primary"
      : logObj.log_level === LOG_LEVEL.WARNING
      ? "text-warning"
      : logObj.log_level === LOG_LEVEL.ERROR
      ? "text-danger"
      : logObj.log_level === LOG_LEVEL.CRITICAL
      ? "text-danger"
      : logObj.log_level === LOG_LEVEL.INFO
      ? "text-success"
      : "";
  return (
    <div onClick={() => handleClick(logIndex, log)} className={className}>
      <>
        [<span className="text-primary">{logObj.timestamp}</span>]{" "}
      </>
      <>
        [<span className={levelClassName}>{logObj.log_level}</span>]{" "}
      </>
      <>
        [<span className="text-primary">{logObj.service} </span>]{" "}
      </>
      <span>{logObj.log} </span>
    </div>
  );
};

LogHighlighter.propTypes = {
  log: PropTypes.object,
  handleClick: PropTypes.func,
  logIndex: PropTypes.number,
  className: PropTypes.string,
};
