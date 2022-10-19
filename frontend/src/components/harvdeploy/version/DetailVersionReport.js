import { useSelector } from "react-redux";
import moment from "moment";
import ReactJson from "@microlink/react-json-view";
import { timeStampFormat } from "../../../utils/utils";
import { JsonDiv } from "../../styled";

function DetailVersionReport(props) {
  const { version } = useSelector((state) => state.harvdeploy);
  const { timezone } = useSelector((state) => state.errorreport);
  return (
    <div className="mb-4">
      <div className="card card-body mb-4">
        <div className="row">
          <div className="col-md-3 mb-2">
            <div className="f-w-600">ID</div>
            <div>{version.id}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Time</div>
            <div>{timeStampFormat(version.reportTime, timezone)}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Dirty</div>
            <div>{version.is_dirty ? "True" : "False"}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Harvester</div>
            <div>{version.report?.data?.serial_number}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Created At</div>
            <div>{moment(version.created).format("LLLL")}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Updated At</div>
            <div>{moment(version.lastModified).format("LLLL")}</div>
          </div>
        </div>
      </div>
      <div className="f-w-600">Report</div>
      <JsonDiv>
        <ReactJson
          src={version.report ? version.report : {}}
          collapsed={3}
          enableClipboard
        />
      </JsonDiv>
    </div>
  );
}

DetailVersionReport.propTypes = {};

export default DetailVersionReport;
