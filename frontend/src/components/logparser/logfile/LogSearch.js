import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  searchLog,
  clearSearch,
  scrollUpIndex,
  scrollDownIndex,
} from "features/logparser/logparserSlice";
import { darkThemeClass } from "utils/utils";

function LogSearch(props) {
  const [search, setSearch] = useState("");
  const [borderEffect, setBorderEffect] = useState({
    up: false,
    down: false,
    exit: false,
  });
  const {
    internal: {
      search: { currentIndex, content, countIndex, searchText },
    },
  } = useSelector((state) => state.logparser);
  const { theme } = useSelector((state) => state.home);
  const dispatch = useDispatch();
  const currIndex = content.length > 0 ? countIndex + 1 : countIndex;
  const inputdark = darkThemeClass("dt-log-search", theme);
  const btn = darkThemeClass("btn-dark", theme);

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      if (search !== searchText) {
        dispatch(clearSearch());
        dispatch(searchLog(search));
        await scrollToIndex();
      } else if (searchText) {
        await scrollToLogIndex("down", true);
      } else {
        return;
      }
    }
  };

  const handleRateChange = (e) => {
    props.dispatchAction({
      type: "ON_PLAY_BACK_RATE",
      payload: Number(e.target.value),
    });
  };

  const scrollToIndex = () => {
    return new Promise((resolve, reject) => {
      props.virtuoso?.current?.scrollToIndex({
        index: currentIndex,
        align: "start",
        behavior: "auto",
      });
      resolve(currentIndex);
    });
  };

  const scrollToLogIndex = async (direction, ignore = false) => {
    const scrollAction = {
      up: scrollUpIndex,
      down: scrollDownIndex,
    };
    dispatch(scrollAction[direction]());
    borderVisual(direction, ignore);
    await scrollToIndex();
  };

  const exitSearch = () => {
    setSearch("");
    dispatch(clearSearch());
    borderVisual("exit");
  };

  const borderVisual = (direction, ignore = false) => {
    if (direction === "up" && !ignore) {
      setBorderEffect((current) => {
        return { ...current, up: true };
      });
      setTimeout(() => {
        setBorderEffect((current) => {
          return { ...current, up: false };
        });
      }, 100);
    } else if (direction === "down" && !ignore) {
      setBorderEffect((current) => {
        return { ...current, down: true };
      });
      setTimeout(() => {
        setBorderEffect((current) => {
          return { ...current, down: false };
        });
      }, 100);
    } else if (direction === "exit" && !ignore) {
      setBorderEffect((current) => {
        return { ...current, exit: true };
      });
      setTimeout(() => {
        setBorderEffect((current) => {
          return { ...current, exit: false };
        });
      }, 100);
    } else {
      return;
    }
  };

  return (
    <div className="nav-wrap mb-4">
      <div className="nav-menu">
        <span>File</span>
        <span>Video</span>
      </div>
      <div className="nav-body">
        <div className="nav-icon-prog">
          <input
            type="range"
            value={props.rate}
            min={0}
            max={2}
            onChange={handleRateChange}
          />
        </div>
        <div className="nav-search">
          <div className="find-bar">
            <div className="find-bar-text">
              <input
                type="text"
                name="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`${inputdark}`}
              />
              <span>
                {currIndex}/{content.length}
              </span>
            </div>
            <div className="find-bar-icons">
              <span
                onClick={() => scrollToLogIndex("up")}
                className={`btn ${borderEffect.up && "bordered-btn"} ${btn}`}
              >
                <i className="las la-arrow-up"></i>
              </span>
              <span
                onClick={() => scrollToLogIndex("down")}
                className={`btn ${borderEffect.down && "bordered-btn"} ${btn}`}
              >
                <i className="las la-arrow-down"></i>
              </span>
              <span
                className={`btn ${borderEffect.exit && "bordered-btn"} ${btn}`}
                onClick={exitSearch}
              >
                <i className="las la-times"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

LogSearch.propTypes = {
  rate: PropTypes.number,
  dispatchAction: PropTypes.func,
  virtuoso: PropTypes.object,
};

export default LogSearch;
