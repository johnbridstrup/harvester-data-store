import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import LogFileList from "components/logparser/logfile/LogFileList";
import { LoaderDiv } from "components/styled";
import {
  getLogFileById,
  getLogSessionById,
  queryLogVideo,
} from "features/logparser/logparserSlice";
import { Loader } from "utils/utils";
import "./styles.css";

function LogFileListView(props) {
  const [fetching, setFetching] = useState(false);
  const dispatch = useDispatch();
  const { sessionId } = useParams();

  useEffect(() => {
    (async () => {
      setFetching(true);
      const res = await dispatch(getLogSessionById(sessionId));
      let logId = res.payload?.logs?.services[0]?.id;
      await dispatch(getLogFileById(logId));
      await dispatch(queryLogVideo({ log_session_id: sessionId }));
      setFetching(false);
    })();
  }, [dispatch, sessionId]);

  return (
    <MainLayout>
      <div className="container-fluid">
        <Header className={"display-4"} title={"Extracted Log Files"} />
        {fetching ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <LogFileList />
        )}
      </div>
    </MainLayout>
  );
}

LogFileListView.propTypes = {};

export default LogFileListView;
