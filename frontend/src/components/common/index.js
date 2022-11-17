import PropTypes from "prop-types";

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
