import moment from "moment";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function ListReleaseCode(props) {
  const { releasecodes } = useSelector((state) => state.release);
  return (
    <>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Fruit</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {releasecodes.map((obj, i) => (
              <tr key={i}>
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
      </div>
    </>
  );
}

ListReleaseCode.propTypes = {};

export default ListReleaseCode;
