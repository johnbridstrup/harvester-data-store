import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LoaderDiv } from "components/styled";
import { Loader, darkThemeClass, timeStampFormat } from "utils/utils";

function EmulatorstatsList(props) {
  const { loading, emustats } = useSelector((state) => state.emulatorstats);
  const { theme } = useSelector((state) => state.home);
  const tabledt = darkThemeClass("dt-table", theme);

  return (
    <>
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <div className="table-responsive mb-4">
          <table className={`table ${tabledt}`}>
            <thead>
              <tr>
                <th>Report Time</th>
                <th>Scene</th>
                <th>Branch</th>
                <th>Date</th>
                <th>Runner</th>
                <th>Elapsed Seconds</th>
                <th>MM Traveled</th>
                <th>Num Grip Attempts</th>
                <th>Grip Success Percentage</th>
                <th>Num Pick Attempts</th>
                <th>Pick Success Percentage</th>
                <th>Thoroughness Percentage</th>
                <th>Detection Success Percentage</th>
                <th>Tags</th>
                <th>Total Targets</th>
              </tr>
            </thead>
            <tbody>
              {emustats.map((obj, _) => (
                <tr key={obj.id}>
                  <td>
                    <Link to={`/emustats/${obj.id}`}>
                      {timeStampFormat(obj.reportTime)}
                    </Link>
                  </td>
                  <td>{obj.scene}</td>
                  <td>{obj.branch}</td>
                  <td>{obj.date}</td>
                  <td>{obj.runner}</td>
                  <td>{obj.elapsed_seconds}</td>
                  <td>{obj.mm_traveled}</td>
                  <td>{obj.num_grip_attempts}</td>
                  <td>{obj.grip_success_percentage}</td>
                  <td>{obj.num_pick_attempts}</td>
                  <td>{obj.pick_success_percentage}</td>
                  <td>{obj.thoroughness_percentage}</td>
                  <td>{obj.detection_success_percentage}</td>
                  <td>{obj.tags.join(", ")}</td>
                  <td>{obj.total_targets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

EmulatorstatsList.propTypes = {};

export default EmulatorstatsList;
