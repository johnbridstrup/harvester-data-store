import moment from "moment";
import { lazy, Suspense, useState } from "react";
import { useSelector } from "react-redux";
import { Loader, timeStampFormat } from "../../../utils/utils";
import { Accordion, LoaderDiv } from "../../styled";
const ReactJson = lazy(() => import("@microlink/react-json-view"));

function DetailJobResult(props) {
  const [detailObj, setDetailObj] = useState({});
  const { jobresult } = useSelector((state) => state.harvjobs);

  const handleHostClick = (obj) => {
    setDetailObj((current) => obj);
  };

  return (
    <>
      <div className="mb-4">
        <div className="card card-body">
          <div className="row">
            <div className="col-md-3 mb-2">
              <div className="f-w-600">ID</div>
              <div>{jobresult.id}</div>
            </div>
            <div className="col-md-3 mb-2">
              <div className="f-w-600">Time</div>
              <div>
                {jobresult.reportTime && timeStampFormat(jobresult.reportTime)}
              </div>
            </div>
            <div className="col-md-3 mb-2">
              <div className="f-w-600">HarvID</div>
              <div>{jobresult.report?.serial_number}</div>
            </div>
            <div className="col-md-3 mb-2">
              <div className="f-w-600">Created At</div>
              <div>{moment(jobresult.created).format("LLLL")}</div>
            </div>
            <div className="col-md-3 mb-2">
              <div className="f-w-600">Updated At</div>
              <div>{moment(jobresult.lastModified).format("LLLL")}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-5">
        <div className="f-w-600 mb-3">Host Results</div>
        {jobresult.host_results?.map((host, _) => (
          <div key={host.id}>
            <div className="table-responsive">
              <table className="table">
                <tbody>
                  <tr
                    className="tr-hover cursor"
                    onClick={() => handleHostClick(host)}
                  >
                    <td>{timeStampFormat(host.timestamp)}</td>
                    <td>{host.host}</td>
                    <td
                      className={`${
                        host.result === "Success"
                          ? "text-success"
                          : host.result === "Pending"
                          ? "text-warning"
                          : "text-danger"
                      }`}
                    >
                      {host.result}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Accordion obj={detailObj} host={host}>
              <Suspense
                fallback={
                  <LoaderDiv>
                    <Loader size={25} />
                  </LoaderDiv>
                }
              >
                {detailObj.id === host.id && (
                  <ReactJson src={detailObj?.details || {}} />
                )}
              </Suspense>
            </Accordion>
          </div>
        ))}
      </div>
    </>
  );
}

DetailJobResult.propTypes = {};

export default DetailJobResult;
