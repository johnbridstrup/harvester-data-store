import moment from "moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { handleDownload } from "utils/services";
import { LoaderDiv } from "components/styled";
import { Loader, darkThemeClass } from "utils/utils";

function PickSessionDetail(props) {
  const { picksession, loading } = useSelector((state) => state.event);
  const { token } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.home);

  const handleDownloadFiles = async (fileObj) => {
    await handleDownload(fileObj, token);
  };

  const cardtheme = darkThemeClass("dt-card-theme", theme);

  return (
    <>
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <div className={`card ${cardtheme}`}>
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-4">
                <div>
                  <strong>UUID</strong>
                </div>
                <div>{picksession.UUID}</div>
              </div>
              <div className="col-md-4">
                <div>
                  <strong>Related Objects</strong>
                </div>
                <div>
                  {picksession.related_objects?.map((obj, index) => (
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
                  {picksession.related_files?.map((obj, index) => (
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
                <div>{moment(picksession.createdAt).format("LLLL")}</div>
              </div>
              <div className="col-md-4">
                <div>
                  <strong>Updated At</strong>
                </div>
                <div>{moment(picksession.lastModified).format("LLLL")}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

PickSessionDetail.propTypes = {};

export default PickSessionDetail;
