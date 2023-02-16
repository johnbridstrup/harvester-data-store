import { lazy, Suspense, useState } from "react";
import { useSelector } from "react-redux";
import { LoaderDiv, NavTabItem, NavTabs, NavTabSpan } from "components/styled";
import { darkThemeClass, Loader, titleCase } from "utils/utils";
const SensorsPlot = lazy(() => import("components/plotly/SensorsPlot"));

function AutodiagnosticDetail(props) {
  const [activetab, setActiveTab] = useState("vacuum");
  const { report, sensors } = useSelector((state) => state.autodiagnostic);
  const { theme } = useSelector((state) => state.home);
  const tabledt = darkThemeClass("dt-table", theme);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className="table-responsive mb-3">
        <table className={`table ${tabledt}`}>
          <thead>
            <tr>
              <th>Result</th>
              <th>Ball Found</th>
              <th>Template Match</th>
              <th>Template Match Error</th>
              <th>Min Vac</th>
              <th>Finger Open Value</th>
              <th>Finger Close Value</th>
              <th>Finger Delta</th>
              <th>Nominal Touch Force</th>
              <th>Max Touch Force</th>
              <th>Gripper</th>
              <th>Report</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{report.run_data?.result ? "success" : "failed"}</td>
              <td>{report.run_data?.ball_found_result ? "True" : "False"}</td>
              <td>
                {report.run_data?.template_match_result ? "True" : "False"}
              </td>
              <td>{report.run_data?.template_match_y_error}</td>
              <td>{report.run_data?.min_vac}</td>
              <td>{report.run_data?.finger_open_value}</td>
              <td>{report.run_data?.finger_closed_value}</td>
              <td>{report.run_data?.finger_delta}</td>
              <td>{report.run_data?.nominal_touch_force}</td>
              <td>{report.run_data?.max_touch_force}</td>
              <td>{report.run_data?.gripper}</td>
              <td>{report.run_data?.report}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <NavTabs>
        {Object.keys(sensors).map((sensor, i) => (
          <NavTabItem key={i}>
            <NavTabSpan
              onClick={() => handleTabChange(sensor, sensors[sensor])}
              activetab={activetab}
              navto={sensor}
              theme={theme}
            >
              {titleCase(sensor)}
            </NavTabSpan>
          </NavTabItem>
        ))}
      </NavTabs>

      <div className="row mb-4">
        <div className="col">
          <Suspense
            fallback={
              <LoaderDiv>
                <Loader size={25} />
              </LoaderDiv>
            }
          >
            <SensorsPlot sensordata={sensors[activetab]} theme={theme} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

AutodiagnosticDetail.propTypes = {};

export default AutodiagnosticDetail;
