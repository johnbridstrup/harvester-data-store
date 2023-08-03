import moment from "moment";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import VSCodeEditor from "@monaco-editor/react";
import { NavTabSpan, NavTabs, NavTabItem } from "components/styled";
import PayloadModal from "components/modals/PayloadModal";
import { darkThemeClass, getHarvId, getUrl, monacoOptions } from "utils/utils";
import { THEME_MODES } from "features/base/constants";

function DetailScheduledJob(props) {
  const [activetab, setActiveTab] = useState("clocked");
  const [payload, setPayload] = useState(null);
  const { scheduledjob } = useSelector((state) => state.jobscheduler);
  const { theme } = useSelector((state) => state.home);
  const payloadRef = useRef(null);

  const tabledt = darkThemeClass("dt-table", theme);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleClick = (obj) => {
    setPayload(obj);
    payloadRef.current.click();
  };

  return (
    <>
      <div className="f-w-600">Overview</div>
      <div className="table-responsive mb-4">
        <table className={`table ${tabledt}`}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Schedule Status</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{scheduledjob.id}</td>
              <td>{scheduledjob.schedule_status}</td>
              <td>{moment(scheduledjob.created).format("LLLL")}</td>
              <td>{moment(scheduledjob.lastModified).format("LLLL")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="f-w-600">Task</div>
      <div className="table-responsive">
        <table className={`table ${tabledt}`}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Task At</th>
              <th>Args</th>
              <th>Kwargs</th>
              <th>Queue</th>
              <th>Exchange</th>
              <th>Routing Key</th>
              <th>Headers</th>
              <th>Priority</th>
              <th>Expires</th>
              <th>Expire Seconds</th>
              <th>One Off</th>
              <th>Start Time</th>
              <th>Enabled</th>
              <th>Last Run At</th>
              <th>Total Run Count</th>
              <th>Date Changed</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{scheduledjob.task?.id}</td>
              <td>{scheduledjob.task?.name}</td>
              <td>{scheduledjob.task?.task}</td>
              <td>{scheduledjob.task?.args}</td>
              <td>{scheduledjob.task?.kwargs}</td>
              <td>{scheduledjob.task?.queue}</td>
              <td>{scheduledjob.task?.exchange}</td>
              <td>{scheduledjob.task?.routing_key}</td>
              <td>{scheduledjob.task?.headers}</td>
              <td>{scheduledjob.task?.priority}</td>
              <td>{scheduledjob.task?.expires}</td>
              <td>{scheduledjob.task?.expire_seconds}</td>
              <td>{scheduledjob.task?.one_off ? "True" : "False"}</td>
              <td>{scheduledjob.task?.start_time}</td>
              <td>{scheduledjob.task?.enabled ? "True" : "False"}</td>
              <td>{scheduledjob.task?.last_run_at}</td>
              <td>{scheduledjob.task?.total_run_count}</td>
              <td>{moment(scheduledjob.task?.date_changed).format("LLLL")}</td>
              <td>{scheduledjob.task?.description}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-2 mb-4">
        <NavTabs>
          <NavTabItem>
            <NavTabSpan
              onClick={() => handleTabChange("clocked")}
              activetab={activetab}
              navto={"clocked"}
              theme={theme}
            >
              Clocked
            </NavTabSpan>
          </NavTabItem>
          <NavTabItem>
            <NavTabSpan
              onClick={() => handleTabChange("interval")}
              activetab={activetab}
              navto={"interval"}
              theme={theme}
            >
              Interval
            </NavTabSpan>
          </NavTabItem>
          <NavTabItem>
            <NavTabSpan
              onClick={() => handleTabChange("crontab")}
              activetab={activetab}
              navto={"crontab"}
              theme={theme}
            >
              Crontabs
            </NavTabSpan>
          </NavTabItem>
        </NavTabs>
        {activetab === "interval" && (
          <div className="table-responsive">
            <table className={`table ${tabledt}`}>
              <thead>
                <tr>
                  <th>Every</th>
                  <th>Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{scheduledjob.task?.interval?.every}</td>
                  <td>{scheduledjob.task?.interval?.period}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activetab === "crontab" && (
          <div className="table-responsive">
            <table className={`table ${tabledt}`}>
              <thead>
                <tr>
                  <th>Timezone</th>
                  <th>Minute</th>
                  <th>Hour</th>
                  <th>Day Of Week</th>
                  <th>Day Of Month</th>
                  <th>Month Of Year</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{scheduledjob.task?.crontab?.timezone}</td>
                  <td>{scheduledjob.task?.crontab?.minute}</td>
                  <td>{scheduledjob.task?.crontab?.hour}</td>
                  <td>{scheduledjob.task?.crontab?.day_of_week}</td>
                  <td>{scheduledjob.task?.crontab?.day_of_month}</td>
                  <td>{scheduledjob.task?.crontab?.month_of_year}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activetab === "clocked" && (
          <div className="table-responsive">
            <table className={`table ${tabledt}`}>
              <thead>
                <tr>
                  <th>Clocked Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {moment(scheduledjob.task?.interval?.clocked_time).format(
                      "LLLL"
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="f-w-600">Job Def (Payload)</div>
      <VSCodeEditor
        height={"40vh"}
        language="json"
        value={JSON.stringify(scheduledjob.job_def, null, 2)}
        theme={theme === THEME_MODES.DARK_THEME ? "vs-dark" : "light"}
        options={{ ...monacoOptions, readOnly: true }}
      />

      <div className="f-w-600">Jobs</div>
      <div className="table-responsive mb-4">
        <table className={`table ${tabledt}`}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Payload</th>
              <th>JobType</th>
              <th>Schema Version</th>
              <th>Status</th>
              <th>Target</th>
              <th>Results</th>
              <th>History</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {scheduledjob.jobs?.map((job, _) => (
              <tr key={job.id}>
                <td>
                  <Link to={`/jobs/${job.id}`}>{job.id}</Link>
                </td>
                <td>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleClick(job.payload)}
                  >
                    View Payload
                  </button>{" "}
                  <button
                    ref={payloadRef}
                    data-bs-toggle="modal"
                    data-bs-target="#payloadModal"
                    style={{ display: "none" }}
                  >
                    View Payload
                  </button>
                </td>
                <td>{job.schema?.jobtype}</td>
                <td>{job.schema?.version}</td>
                <td
                  className={`${
                    job.jobstatus === "Success"
                      ? "text-success"
                      : job.jobstatus === "Pending"
                      ? "text-warning"
                      : "text-danger"
                  }`}
                >
                  {job.jobstatus}
                </td>
                <td>{getHarvId(job.results, job.target)}</td>
                <td>
                  <Link to={`/${getUrl(job.results)}`}>
                    <i className="las la-eye"></i>
                  </Link>
                </td>
                <td>
                  <Link to={`/jobstatus/${job.id}`}>
                    <i className="las la-eye"></i>
                  </Link>
                </td>
                <td>{moment(job.created).format("LLLL")}</td>
                <td>{moment(job.lastModified).format("LLLL")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PayloadModal payload={payload} theme={theme} />
    </>
  );
}

DetailScheduledJob.propTypes = {};

export default DetailScheduledJob;
