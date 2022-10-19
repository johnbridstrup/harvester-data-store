import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import moment from "moment";
import { Loader, timeStampFormat } from "../../../utils/utils";
import { LoaderDiv } from "../../styled";

function ListVersionReport(props) {
  const { versions, loading } = useSelector((state) => state.harvdeploy);
  const { timezone } = useSelector((state) => state.errorreport);
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
                <th>Harvester</th>
                <th>Created At</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((version, index) => (
                <tr key={index}>
                  <td>{version.id}</td>
                  <td>
                    <Link to={`/harvversion/${version.id}`}>
                      {timeStampFormat(version.reportTime, timezone)}
                    </Link>
                  </td>
                  <td>{version.is_dirty ? "True" : "False"}</td>
                  <td>{version.report?.data?.serial_number}</td>
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

ListVersionReport.propTypes = {};

export default ListVersionReport;
