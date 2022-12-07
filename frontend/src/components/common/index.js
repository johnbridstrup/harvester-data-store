import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export const DownloadButton = (props) => {
  return (
    <div className="flex-right mb-2">
      <span onClick={props.popUp} className="btn btn-default mx-2">
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

DownloadButton.propTypes = {
  popUp: PropTypes.func,
  downloadRef: PropTypes.object,
};

export function BackButton(props) {
  const goBack = (e) => {
    e.preventDefault();
    window.history.back();
  };
  return (
    <div className={`${props.mb ? props.mb : ""} ${props.mt ? props.mt : ""}`}>
      <Link to={``} className="btn" onClick={goBack}>
        <i className="las la-arrow-left"></i>Back
      </Link>
    </div>
  );
}
