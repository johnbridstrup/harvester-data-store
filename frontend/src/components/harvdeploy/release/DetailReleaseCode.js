import moment from "moment";
import { useSelector } from "react-redux";
import ReactJson from "@microlink/react-json-view";
import { JsonDiv } from "../../styled";

function DetailReleaseCode(props) {
  const { releasecode } = useSelector((state) => state.harvdeploy);
  return (
    <>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <td>Version</td>
              <td>Fruit</td>
              <td>Created At</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{releasecode.version}</td>
              <td>{releasecode.fruit?.name}</td>
              <td>{moment(releasecode.created).format("LLLL")}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <JsonDiv>
          <ReactJson
            src={releasecode.release}
            collapsed={2}
            thme="monokai"
            enableClipboard
          />
        </JsonDiv>
      </div>
    </>
  );
}

DetailReleaseCode.propTypes = {};

export default DetailReleaseCode;
