import moment from "moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LoaderDiv } from "components/styled";
import { darkThemeClass, Loader } from "utils/utils";
import { handleDownload } from "utils/services";

function S3FileList(props) {
  const { s3files, loading } = useSelector((state) => state.s3file);
  const { token } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.home);
  const tabledt = darkThemeClass("dt-table", theme);
  const download = (obj) => handleDownload({ url: obj.file }, token);

  return (
    <>
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <div className="table-responsive">
          <table className={`table ${tabledt}`}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>File Type</th>
                <th>Download</th>
                <th>Event</th>
                <th>Created At</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {s3files.map((obj, _) => (
                <tr key={obj.id}>
                  <td>
                    <Link to={`/s3files/${obj.id}`}>{obj.id}</Link>
                  </td>
                  <td>{obj.key}</td>
                  <td>{obj.filetype}</td>
                  <td>
                    <span onClick={() => download(obj)} className="cursor">
                      <i className="las la-cloud-download-alt la-2x"></i>
                    </span>
                  </td>
                  <td>
                    <Link to={`/events/${obj.event.id}`}>{obj.event.UUID}</Link>
                  </td>
                  <td>{moment(obj.createdAt).format("LLLL")}</td>
                  <td>{moment(obj.lastModified).format("LLLL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

S3FileList.propTypes = {};

export default S3FileList;
