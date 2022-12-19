import moment from "moment";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { LoaderDiv } from "../styled";
import { Loader } from "utils/utils";
import ConfirmModal from "../modals/ConfirmModal";
import {
  execMigration,
  listMigrationLogs,
} from "features/migration/migrationSlice";
import { FULLFILLED_PROMISE } from "features/base/constants";

function MigrationList(props) {
  const { user } = useSelector((state) => state.auth);
  const { loading, migrations, queueing } = useSelector(
    (state) => state.migration
  );
  const dispatch = useDispatch();
  const confirmRef = useRef(null);

  const confirmPopUp = () => {
    if (!user?.is_superuser) {
      toast.error("Permissions denied!");
      return;
    }
    confirmRef.current.click();
  };

  const queueMigration = async () => {
    const res = await dispatch(execMigration());
    if (res.type === FULLFILLED_PROMISE.migration) {
      confirmPopUp();
      toast.success("migration queued successfully");
      await dispatch(listMigrationLogs());
    } else {
      confirmPopUp();
      toast.error("something went wrong. please try again.");
    }
  };

  return (
    <>
      <div className="flex-right mb-2">
        <button onClick={confirmPopUp} className="btn btn-primary">
          Queue Migrations
        </button>
        <button
          ref={props.confirmRef}
          data-bs-toggle="modal"
          data-bs-target="#confirmModal"
          style={{ display: "none" }}
        >
          Queue Migrations
        </button>
      </div>
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
                <th>Result</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Githash</th>
                <th>Created At</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {migrations.map((log, _) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>
                    <Link to={`/migrations/${log.id}`}>{log.result}</Link>
                  </td>
                  <td>{moment(log.startTime).format("LLLL")}</td>
                  <td>{moment(log.endTime).format("LLLL")}</td>
                  <td>{log.githash}</td>
                  <td>{moment(log.created).format("LLLL")}</td>
                  <td>{moment(log.lastModified).format("LLLL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <ConfirmModal
        cancelRequest={confirmPopUp}
        confirmRef={confirmRef}
        confirmRequest={queueMigration}
        msg={"Are you sure you want to make migrations"}
        loading={queueing}
      />
    </>
  );
}

MigrationList.propTypes = {};

export default MigrationList;
