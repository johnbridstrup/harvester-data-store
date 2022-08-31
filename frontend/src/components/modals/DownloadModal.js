import PropTypes from "prop-types";

function DownloadModal(props) {
  return (
    <div className="col-md-8">
      <div
        className="modal fade"
        id="downloadModal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true"
        style={{ display: "none" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content profile-modal">
            <div
              className="text-right"
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <button
                type="button"
                className="btn closeModalBtn"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span className="las la-times"></span>
              </button>
            </div>
            <div className="modal-body text-center px-5 pb-2">
              DOWNLOADABLE FILES
            </div>

            <div className="modal-body px-5 pb-4">
              <div>
                <ul className="list-group">
                  {props.eventObj?.related_objects?.map((file, index) => (
                    <li
                      className="list-group-item cursor"
                      key={index}
                      onClick={() => props.handleDownload(file)}
                    >
                      <span>{file.object}</span>
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
};

export default DownloadModal;
