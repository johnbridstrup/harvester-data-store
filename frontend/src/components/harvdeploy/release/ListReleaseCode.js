import moment from "moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Loader } from "../../../utils/utils";
import { LoaderDiv } from "../../styled";

function ListReleaseCode(props) {
  const { releasecodes, loading } = useSelector((state) => state.harvdeploy);
  return (
    <>
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
                <th>Version</th>
                <th>Fruit</th>
                <th>Created At</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {releasecodes.map((obj, i) => (
                <tr key={i}>
                  <td>{obj.id}</td>
                  <td>
                    <Link to={`/release/${obj.id}`}>{obj.version}</Link>
                  </td>
                  <td>{obj.fruit?.name}</td>
                  <td>{moment(obj.created).format("LLLL")}</td>
                  <td>{moment(obj.lastModified).format("LLLL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

ListReleaseCode.propTypes = {};

export default ListReleaseCode;
