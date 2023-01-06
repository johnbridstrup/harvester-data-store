import { useReducer, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactPlayer from "react-player";
import { NavTabItem, NavTabs, NavTabSpan } from "components/styled";
import LoadVideo from "./LoadVideo";
import LogSearch from "./LogSearch";
import TabbedServices from "./TabbedServices";
import { getCurrIndex, imagePath } from "utils/utils";
import { queryLogVideo, setCurrIndex } from "features/logparser/logparserSlice";

const componentState = {
  videoActiveTab: "",
  serviceActiveTab: "",
  playbackRate: 1,
};

function reducer(state, action) {
  switch (action.type) {
    case "ON_VIDEO_TAB_CHANGE":
      return {
        ...state,
        videoActiveTab: action.payload,
      };
    case "ON_SERVICE_TAB_CHANGE":
      return {
        ...state,
        serviceActiveTab: action.payload,
      };
    case "ON_PLAY_BACK_RATE":
      return {
        ...state,
        playbackRate: action.payload,
      };
    default:
      return state;
  }
}

function LogFileList(props) {
  const [state, dispatchAction] = useReducer(reducer, componentState);
  const {
    internal: { videos },
    logvideo,
    logfile,
    logsession,
  } = useSelector((state) => state.logparser);
  const videoRef = useRef(null);
  const virtuoso = useRef(null);
  const dispatch = useDispatch();

  const handleVideTabChange = async (tab) => {
    dispatchAction({ type: "ON_VIDEO_TAB_CHANGE", payload: tab });
    let queryObj = {
      category: tab,
      log_session_id: logsession.id,
    };
    await dispatch(queryLogVideo(queryObj));
  };

  const handleOnProgress = async (state) => {
    let playedSeconds = Math.floor(state.playedSeconds);
    if (logvideo?.meta?.length && logvideo?.meta[0]) {
      let metaTimestamp = logvideo.meta[0].ts + playedSeconds;
      let currentIndex = await getCurrIndex(metaTimestamp, logfile);
      dispatch(setCurrIndex(currentIndex));
      virtuoso.current?.scrollToIndex({
        index: currentIndex,
        align: "start",
        behavior: "auto",
      });
    }
  };

  const playbackRate = state.playbackRate === 0 ? 0.5 : state.playbackRate;

  return (
    <div>
      <LogSearch
        rate={state.playbackRate}
        dispatchAction={dispatchAction}
        virtuoso={virtuoso}
      />
      <div className="row mb-4">
        <div className="col-md-6">
          <LoadVideo category={state.videoActiveTab} />
          <div className="row">
            <div className="col">
              <div style={{ height: "400px" }}>
                <NavTabs>
                  {videos.map((vid, _) => (
                    <NavTabItem key={vid.id}>
                      <NavTabSpan
                        activetab={state.videoActiveTab}
                        navto={vid.category}
                        onClick={() => handleVideTabChange(vid.category)}
                      >
                        {vid.category.toUpperCase()}
                      </NavTabSpan>
                    </NavTabItem>
                  ))}
                </NavTabs>
                {logvideo.video_avi ? (
                  <div className="p-top">
                    <div className="embed-responsive embed-responsive-16by9">
                      <ReactPlayer
                        controls
                        config={{ file: { forceVideo: true } }}
                        url={logvideo.video_avi}
                        width="100%"
                        height="320px"
                        ref={videoRef}
                        playbackRate={playbackRate}
                        onProgress={(state) => {
                          handleOnProgress(state);
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="no-video p-top">
                    <img
                      className="img-unvailable"
                      src={imagePath("novideo")}
                      alt="novideo"
                    />
                    <p>Video Unavailable</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div style={{ height: "400px" }}>
                <NavTabs>
                  <NavTabItem>
                    <NavTabSpan activetab={"Table"} navto={"Table"}>
                      Table
                    </NavTabSpan>
                  </NavTabItem>
                  <NavTabItem>
                    <NavTabSpan
                      activetab={"Gripper Plot"}
                      navto={"Gripper Plot"}
                    >
                      Gripper Plot
                    </NavTabSpan>
                  </NavTabItem>
                </NavTabs>
                <div className="in-progress p-top">
                  <img
                    className="img-unvailable"
                    src={imagePath("inprogress")}
                    alt="inprogress"
                  />
                  <p>Feature currently unavailable</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <TabbedServices
            activeTab={state.serviceActiveTab}
            dispatchAction={dispatchAction}
            virtuoso={virtuoso}
          />
        </div>
      </div>
    </div>
  );
}

LogFileList.propTypes = {};

export default LogFileList;
