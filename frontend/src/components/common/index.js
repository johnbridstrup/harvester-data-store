import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { darkThemeClass } from "utils/utils";

export const DownloadButton = (props) => {
  const btn = darkThemeClass("btn-dark", props.theme);
  return (
    <div className="flex-right mb-2">
      <span onClick={props.popUp} className={`btn btn-default mx-2 ${btn}`}>
        Get Files
      </span>
      <button
        ref={props.downloadRef}
        data-bs-toggle="modal"
        data-bs-target="#downloadModal"
        style={{ display: "none" }}
      >
        Get Files
      </button>
    </div>
  );
};

export function BackButton(props) {
  const goBack = (e) => {
    e.preventDefault();
    window.history.back();
  };
  const btn = darkThemeClass("btn-dark", props.theme);
  return (
    <div className={`${props.mb ? props.mb : ""} ${props.mt ? props.mt : ""}`}>
      <Link to={``} className={`btn ${btn}`} onClick={goBack}>
        <i className="las la-arrow-left"></i>Back
      </Link>
    </div>
  );
}

export const HarvesterLink = (props) => {
  return (
    <Link to={`/harvesters/${props.harvester?.id}`}>
      {props.harvester?.harv_id}
    </Link>
  );
};

DownloadButton.propTypes = {
  popUp: PropTypes.func,
  downloadRef: PropTypes.object,
  theme: PropTypes.string,
};

BackButton.propTypes = {
  theme: PropTypes.string,
  mb: PropTypes.string,
  mt: PropTypes.string,
};

HarvesterLink.propTypes = {
  harvester: PropTypes.object,
};
