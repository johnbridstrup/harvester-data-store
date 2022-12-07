import moment from "moment";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function BackButton(props) {
  const goBack = (e) => {
    e.preventDefault();
    window.history.back();
  };
  return (
    <div className={`${props.mb ? props.mb : ""} ${props.mt ? props.mt : ""}`}>
      <Link to={``} className="btn" onClick={goBack}>
        <i className="las la-arrow-left"></i>Back
      </Link>
    </div>
  );
}

export const JobStatusHistory = (props) => {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Status History</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {props.jobstatuses?.map((status, _) => (
            <tr key={status.history_id}>
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
  );
};

export const RightButtonGroup = (props) => {
  return (
    <div className="flex-right mb-2">
      <span onClick={props.confirmPopUp} className="btn btn-default mx-2">
        Reschedule
      </span>
      <span onClick={props.popUp} className="btn btn-default mx-2">
        Get Files
      </span>
      <button
        ref={props.downloadRef}
        data-bs-toggle="modal"
        data-bs-target="#downloadModal"
        style={{ display: "none" }}
      >
        Get Files
      </button>
      <button
        ref={props.confirmRef}
        data-bs-toggle="modal"
        data-bs-target="#confirmModal"
        style={{ display: "none" }}
      >
        Reschedule
      </button>
    </div>
  );
};

BackButton.propTypes = {
  mb: PropTypes.string,
  mt: PropTypes.string,
  route: PropTypes.string,
};

JobStatusHistory.propTypes = {
  jobstatuses: PropTypes.array,
};

RightButtonGroup.propTypes = {
  popUp: PropTypes.func,
  downloadRef: PropTypes.object,
  confirmRef: PropTypes.object,
  confirmPopUp: PropTypes.func,
};

export default BackButton;
