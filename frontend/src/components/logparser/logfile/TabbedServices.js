import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Virtuoso } from "react-virtuoso";
import PropTypes from "prop-types";
import {
  clearMarker,
  getLogFileById,
  setCurrIndex,
  setMarker,
} from "features/logparser/logparserSlice";
import { getCurrIndex } from "utils/utils";
import { NavTabItem, NavTabs, NavTabSpan } from "components/styled";
import { LogHighlighter } from "../helpers";

function TabbedServices(props) {
  const [fetching, setFetching] = useState(false);
  const {
    logfile,
    currentMarker,
    currentIndex,
    logvideo,
    internal: { services },
  } = useSelector((state) => state.logparser);

  const dispatch = useDispatch();
  const content = logfile.content || [];

  const handleTabChange = async (tabObj) => {
    props.dispatchAction({
      type: "ON_SERVICE_TAB_CHANGE",
      payload: `${tabObj.service}.${tabObj.robot}`,
    });
    setFetching(true);
    const res = await dispatch(getLogFileById(tabObj.id));
    setFetching(false);
    let currentIndex = await getCurrIndex(currentMarker, res.payload);
    dispatch(setCurrIndex(currentIndex));
    setTimeout(() => {
      props.virtuoso.current.scrollToIndex({
        index: currentIndex,
        align: "start",
        behavior: "auto",
      });
    }, 100);
  };

  const seekToSeconds = (seconds) => {
    return new Promise((resolve, reject) => {
      props.videoRef?.current?.seekTo(seconds, "seconds");
      resolve(seconds);
    });
  };

  const handleLineClick = async (index, log) => {
    dispatch(setMarker({ index, log }));
    if (logvideo?.meta?.length && logvideo.meta[0]) {
      let wholeSeconds = Math.floor(log.timestamp - logvideo.meta[0].ts);
      if (wholeSeconds < 0) {
        wholeSeconds = 0;
      }
      await seekToSeconds(wholeSeconds);
    }
  };

  const clearSelection = () => {
    dispatch(clearMarker());
  };

  return (
    <div>
      {currentMarker && (
        <div className="current-marker">
          <span>
            current selection at time: {currentMarker} index: {currentIndex}
          </span>{" "}
          <span className="cursor">
            <i onClick={clearSelection} className="las la-times"></i>
          </span>
        </div>
      )}
      <NavTabs>
        {services.map((x, i) => (
          <NavTabItem key={i}>
            <NavTabSpan
              activetab={props.activeTab}
              navto={`${x.display}`}
              onClick={() => handleTabChange(x)}
            >
              {`${x.display}`}
            </NavTabSpan>
          </NavTabItem>
        ))}
      </NavTabs>
      <div className="tab-content">
        {fetching ? (
          <div className="loading">Loading...</div>
        ) : (
          <Virtuoso
            data={content}
            ref={props.virtuoso}
            itemContent={(index, log) => {
              return (
                <LogHighlighter
                  key={index}
                  handleClick={handleLineClick}
                  className={`content ${
                    currentIndex === index ? "marked-bg" : ""
                  }`}
                  log={log}
                  logIndex={index}
                />
              );
            }}
          />
        )}
      </div>
    </div>
  );
}

TabbedServices.propTypes = {
  dispatchAction: PropTypes.func,
  activeTab: PropTypes.string,
  virtuoso: PropTypes.object,
  videoRef: PropTypes.object,
};

export default TabbedServices;
