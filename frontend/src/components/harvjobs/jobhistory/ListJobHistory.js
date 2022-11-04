import moment from "moment";
import { useSelector } from "react-redux";
import { Loader } from "../../../utils/utils";
import { LoaderDiv } from "../../styled";

function ListJobHistory(props) {
  const { jobstatuses, loading } = useSelector((state) => state.harvjobs);
  return (
    <>
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>History ID</th>
                <th>Job Status</th>
                <th>History Date</th>
              </tr>
            </thead>
            <tbody>
              {jobstatuses.map((status, _) => (
                <tr key={status.history_id}>
                  <td>{status.history_id}</td>
                  <td
                    className={`${
                      status.jobstatus === "Success"
                        ? "text-success"
                        : status.jobstatus === "Pending"
                        ? "text-warning"
                        : "text-danger"
                    } `}
                  >
                    {status.jobstatus}
                  </td>
                  <td>{moment(status.history_date).format("LLLL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

ListJobHistory.propTypes = {};

export default ListJobHistory;
