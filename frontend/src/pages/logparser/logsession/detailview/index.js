import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { BackButton } from "components/common";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import LogSessionDetail from "components/logparser/logsession/LogSessionDetail";
import { LoaderDiv } from "components/styled";
import { getLogSessionById } from "features/logparser/logparserSlice";
import { Loader } from "utils/utils";
import "./styles.css";

function LogSessionDetailView(props) {
  const { loading } = useSelector((state) => state.logparser);
  const { sessionId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(getLogSessionById(sessionId));
    })();
  }, [dispatch, sessionId]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS LogSession"}
          reportId={sessionId}
          className={"display-4 mb-4"}
        />
        <BackButton />
        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <LogSessionDetail />
        )}
      </div>
    </MainLayout>
  );
}

LogSessionDetailView.propTypes = {};

export default LogSessionDetailView;
