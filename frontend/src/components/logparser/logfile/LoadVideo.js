import { useState } from "react";
import Select from "react-select";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { handleSelectFactory, transformRobots } from "utils/utils";
import { queryLogVideo } from "features/logparser/logparserSlice";

function LoadVideo(props) {
  const {
    internal: { robots, harv_id },
    logsession,
  } = useSelector((state) => state.logparser);
  const option = { label: `harv id ${harv_id}`, value: harv_id };
  const [selectedRobot, setSelectedRobot] = useState({
    label: "robot 0",
    value: 0,
  });
  const [selectedHarv, setSelectedHarv] = useState(option);
  const [fetching, setFetching] = useState(false);
  const dispatch = useDispatch();
  const handleHarvSelect = handleSelectFactory(setSelectedHarv);
  const handleRobotSelect = handleSelectFactory(setSelectedRobot);

  const robotOptions = transformRobots(robots);
  const harvOptions = [option];

  const loadLogVideo = async () => {
    let queryObj = {};
    if (selectedRobot && selectedRobot.hasOwnProperty("value")) {
      queryObj["robot"] = selectedRobot.value;
    }
    if (harv_id) {
      queryObj["log_session__harv__harv_id"] = harv_id;
    }
    if (props.category) {
      queryObj["category"] = props.category;
    }
    queryObj["log_session_id"] = logsession.id;
    setFetching(true);
    await dispatch(queryLogVideo(queryObj));
    setFetching(false);
  };

  return (
    <div className="row mb-4">
      <div className="col-md-4">
        <Select
          isSearchable
          isClearable
          options={robotOptions}
          defaultValue={selectedRobot}
          value={selectedRobot}
          onChange={handleRobotSelect}
          placeholder="robot id e.g 0"
          className="load-video"
        />
      </div>
      <div className="col-md-4">
        <Select
          isSearchable
          isClearable
          isDisabled
          options={harvOptions}
          defaultValue={selectedHarv}
          value={selectedHarv}
          onChange={handleHarvSelect}
          placeholder="harvester e.g 11"
          className="load-video"
        />
      </div>
      <div className="col-md-4">
        <span onClick={loadLogVideo} className="btn">
          {fetching ? "loading..." : "Load Video"}
        </span>
      </div>
    </div>
  );
}

LoadVideo.propTypes = {
  category: PropTypes.string,
};

export default LoadVideo;
