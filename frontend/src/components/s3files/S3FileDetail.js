import moment from "moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { handleDownload } from "utils/services";
import { darkThemeClass } from "utils/utils";

function S3FileDetail(props) {
  const { s3file } = useSelector((state) => state.s3file);
  const { token } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.home);
  const download = (fileUrl) => handleDownload({ url: fileUrl }, token);
  const cardtheme = darkThemeClass("dt-card-theme", theme);

  return (
    <div className={`card ${cardtheme}`}>
      <div className="card-body">
        <div className="row mb-4">
          <div className="col-md-4">
            <div>
              <strong>ID</strong>
            </div>
            <div>{s3file.id}</div>
          </div>
          <div className="col-md-4">
            <div>
              <strong>Name (key)</strong>
            </div>
            <div>{s3file.key}</div>
          </div>
          <div className="col-md-4">
            <div>
              <strong>File Type</strong>
            </div>
            <div>{s3file.filetype}</div>
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-md-4">
            <div>
              <strong>Download</strong>
            </div>
            <div>
              <span onClick={() => download(s3file.file)} className="cursor">
                <i className="las la-cloud-download-alt la-2x"></i>
              </span>
            </div>
          </div>
          <div className="col-md-4">
            <div>
              <strong>Event</strong>
            </div>
            <div>
              <Link to={`/events/${s3file.event?.id}`}>
                {s3file.event?.UUID}
              </Link>
            </div>
          </div>
          <div className="col-md-4">
            <div>
              <strong>Created At</strong>
            </div>
            <div>{moment(s3file.createdAt).format("LLLL")}</div>
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-md-4">
            <div>
              <strong>Updated At</strong>
            </div>
            <div>{moment(s3file.lastModified).format("LLLL")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

S3FileDetail.propTypes = {};

export default S3FileDetail;
