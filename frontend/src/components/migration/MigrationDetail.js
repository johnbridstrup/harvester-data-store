import moment from "moment";
import { useSelector } from "react-redux";

function MigrationDetail(props) {
  const { migration } = useSelector((state) => state.migration);
  return (
    <>
      <div className="card card-body mb-2" data-testid="detailComponent">
        <div className="row">
          <div className="col-md-3 mb-2">
            <div className="f-w-600">ID</div>
            <div>{migration.id}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Result</div>
            <div>{migration.result}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Githash</div>
            <div>{migration.githash}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Start Time</div>
            <div>{moment(migration.startTime).format("LLLL")}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">End Time</div>
            <div>{moment(migration.endTime).format("LLLL")}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Created At</div>
            <div>{moment(migration.created).format("LLLL")}</div>
          </div>
          <div className="col-md-3 mb-2">
            <div className="f-w-600">Updated At</div>
            <div>{moment(migration.lastModified).format("LLLL")}</div>
          </div>
        </div>
      </div>
      <div className="card card-body mb-2">
        <div className="row">
          <div className="col-md">
            <div className="f-w-600">Output</div>
            <pre style={{ height: "400px", whiteSpace: "break-spaces" }}>
              <code className="language-bash">{migration.output}</code>
            </pre>
          </div>
        </div>
      </div>
    </>
  );
}

MigrationDetail.propTypes = {};

export default MigrationDetail;
