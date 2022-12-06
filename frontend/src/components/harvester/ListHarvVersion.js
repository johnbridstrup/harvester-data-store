import moment from "moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Loader, timeStampFormat } from "../../utils/utils";
import { LoaderDiv } from "../styled";

function ListHarvVersion(props) {
  const { harvversion, loading } = useSelector((state) => state.harvester);
  return (
    <div className="mb-4">
      <div className="table-responsive">
        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Time</th>
                <th>Dirty</th>
                <th>Created At</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {harvversion.map((version, _) => (
                <tr key={version.id}>
                  <td>{version.id}</td>
                  <td>
                    <Link to={`/harvversion/${version.id}`}>
                      {timeStampFormat(version.reportTime)}
                    </Link>
                  </td>
                  <td>{version.is_dirty ? "True" : "False"}</td>
                  <td>{moment(version.created).format("LLLL")}</td>
                  <td>{moment(version.lastModified).format("LLLL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

ListHarvVersion.propTypes = {};

export default ListHarvVersion;
