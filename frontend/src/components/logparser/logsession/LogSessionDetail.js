import moment from "moment";
import { useSelector } from "react-redux";
import { darkThemeClass } from "utils/utils";

function LogSessionDetail(props) {
  const { logsession } = useSelector((state) => state.logparser);
  const { theme } = useSelector((state) => state.home);
  const cardtheme = darkThemeClass("dt-card-theme", theme);

  return (
    <div className="mb-4 mt-3">
      <div className={`card card-body mb-4 ${cardtheme}`}>
        <div className="row">
          <div className="col-md-3 mb-2">
            <div className="f-w-600">ID</div>
            <div>{logsession.id}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Name</div>
            <div>{logsession.name}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Harvester</div>
            <div>{logsession.logs?.harv_id}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Log Date</div>
            <div>{moment(logsession.date_time).format("LLLL")}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Created At</div>
            <div>{moment(logsession.created).format("LLLL")}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Updated At</div>
            <div>{moment(logsession.lastModified).format("LLLL")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

LogSessionDetail.propTypes = {};

export default LogSessionDetail;
