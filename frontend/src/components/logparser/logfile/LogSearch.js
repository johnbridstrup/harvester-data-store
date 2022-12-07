import { useState } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { searchLog } from "../../../features/logparser/logparserSlice";

function LogSearch(props) {
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const handleSearchLog = () => {
    dispatch(searchLog(search));
  };

  const handleRateChange = (e) => {
    props.dispatchAction({
      type: "ON_PLAY_BACK_RATE",
      payload: Number(e.target.value),
    });
  };

  return (
    <div className="nav-wrap mb-4">
      <div className="nav-menu">
        <span>File</span>
        <span>Video</span>
      </div>
      <div className="nav-body">
        <div className="nav-icon-prog">
          <span>
            <i className="las la-folder-open"></i>
          </span>
          <span>
            <i className="las la-play"></i>
          </span>
          <span>
            <i className="las la-stop"></i>
          </span>
          <span>
            <input
              type="range"
              value={props.rate}
              min={0}
              max={2}
              onChange={handleRateChange}
            />
          </span>
        </div>
        <div className="nav-search">
          <input
            type="text"
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="btn" onClick={handleSearchLog}>
            Search
          </span>
        </div>
      </div>
    </div>
  );
}

LogSearch.propTypes = {
  rate: PropTypes.number,
  dispatchAction: PropTypes.func,
};

export default LogSearch;
