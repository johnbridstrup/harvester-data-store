import PropTypes from "prop-types";
import { darkThemeClass } from "utils/utils";

function DownloadModal(props) {
  const modal = darkThemeClass("dt-modal-content", props.theme);
  return (
    <div className="col-md-8">
      <div
        className="modal fade"
        id="downloadModal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="modal-center"
        aria-hidden="true"
        style={{ display: "none" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className={`modal-content ${modal}`}>
            <div
              className="text-right"
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <button
                type="button"
                className="btn"
                data-bs-dismiss="modal"
                aria-label="close"
              >
                <span
                  className={`las la-times ${modal && "text-white"}`}
                ></span>
              </button>
            </div>
            <div className="modal-body text-center px-5 pb-2">
              DOWNLOADABLE FILES
            </div>

            <div className="modal-body px-5 pb-4">
              <div>
                <ul className="list-group">
                  {props.eventObj?.related_files?.map((file, index) => (
                    <li
                      className="list-group-item cursor"
                      key={index}
                      onClick={() => props.handleDownload(file)}
                    >
                      <span style={{ fontSize: "1.5rem" }}>
                        {file.filetype}
                      </span>
                      <i
                        className="las la-download"
                        style={{ fontSize: "1.8rem", marginLeft: "1rem" }}
                      ></i>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

DownloadModal.propTypes = {
  eventObj: PropTypes.object,
  relatedFiles: PropTypes.array,
  theme: PropTypes.string,
};

export default DownloadModal;
