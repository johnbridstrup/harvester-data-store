import moment from "moment";
import { useSelector } from "react-redux";
import ReactJson from "@microlink/react-json-view";
import { JsonDiv } from "../styled";
import { darkThemeClass, getHistoryType } from "utils/utils";

function DetailHarvesterHistory(props) {
  const { historyObj } = useSelector((state) => state.harvester);
  const { theme } = useSelector((state) => state.home);
  const cardtheme = darkThemeClass("dt-card-theme", theme);
  return (
    <div className="mb-4">
      <div className={`card card-body mb-4 ${cardtheme}`}>
        <div className="row">
          <div className="col-md-3 mb-2">
            <div className="f-w-600">ID</div>
            <div>{historyObj.history_id}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Name</div>
            <div>{historyObj.name}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Harv ID</div>
            <div>{historyObj.harv_id}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Fruit</div>
            <div>{historyObj.fruit?.name}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Location</div>
            <div>{historyObj.location?.ranch}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Emulator</div>
            <div>{historyObj.is_emulator ? "True" : "False"}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">History Date</div>
            <div>{moment(historyObj.history_date).format("LLLL")}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">History Type</div>
            <div>{getHistoryType(historyObj.history_type)}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Created At</div>
            <div>{moment(historyObj.created).format("LLLL")}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Updated At</div>
            <div>{moment(historyObj.lastModified).format("LLLL")}</div>
          </div>
        </div>
      </div>
      <div className="f-w-600">Release</div>
      <JsonDiv>
        <ReactJson
          src={historyObj.release ? historyObj.release : {}}
          collapsed={3}
          enableClipboard
          theme={cardtheme ? "monokai" : "monokaii"}
        />
      </JsonDiv>
    </div>
  );
}

DetailHarvesterHistory.propTypes = {};

export default DetailHarvesterHistory;
