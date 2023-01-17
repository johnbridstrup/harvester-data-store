import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MainLayout from "components/layout/main";
import Header from "components/layout/header";
import { getJobResultById } from "features/harvjobs/harvjobSlice";
import BackButton from "components/harvjobs/helpers";
import DetailJobResult from "components/harvjobs/jobresults/DetailJobResult";
import { LoaderDiv } from "components/styled";
import { Loader } from "utils/utils";
import "./styles.css";

function JobResultDetailView(props) {
  const { loading } = useSelector((state) => state.harvjobs);
  const { theme } = useSelector((state) => state.home);
  const { jobresultId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(getJobResultById(jobresultId));
    })();
  }, [dispatch, jobresultId]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Job Results"}
          className={`display-6 mt-4 mb-4`}
          reportId={jobresultId}
        />
        <BackButton mb={"mb-4"} theme={theme} />
        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <DetailJobResult />
        )}
      </div>
    </MainLayout>
  );
}

JobResultDetailView.propTypes = {};

export default JobResultDetailView;
