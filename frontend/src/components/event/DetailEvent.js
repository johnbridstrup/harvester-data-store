import moment from "moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { handleDownload } from "utils/services";
import { darkThemeClass } from "utils/utils";

function DetailEvent(props) {
  const { event } = useSelector((state) => state.event);
  const { token } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.home);

  const handleDownloadFiles = async (fileObj) => {
    await handleDownload(fileObj, token);
  };

  const cardtheme = darkThemeClass("dt-card-theme", theme);

  return (
    <>
      <div className={`card ${cardtheme}`}>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-4">
              <div>
                <strong>UUID</strong>
              </div>
              <div>{event.UUID}</div>
            </div>
            <div className="col-md-4">
              <div>
                <strong>Related Objects</strong>
              </div>
              <div>
                {event.related_objects?.map((obj, index) => (
                  <Link to={obj.url} key={index}>
                    <span>{obj.object}</span>
                    <br />
                  </Link>
                ))}
              </div>
            </div>
            <div className="col-md-4">
              <div>
                <strong>Related Files</strong>
              </div>
              <div>
                {event.related_files?.map((obj, index) => (
                  <a
                    href="#!"
                    key={index}
                    onClick={() => handleDownloadFiles(obj)}
                  >
                    <span>{obj.filetype}</span>
                    <br />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-md-4">
              <div>
                <strong>Created At</strong>
              </div>
              <div>{moment(event.createdAt).format("LLLL")}</div>
            </div>
            <div className="col-md-4">
              <div>
                <strong>Updated At</strong>
              </div>
              <div>{moment(event.lastModified).format("LLLL")}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

DetailEvent.propTypes = {};

export default DetailEvent;
