import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import MainLayout from "components/layout/main";
import Header from "components/layout/header";
import { BackButton } from "components/common";
import { LoaderDiv } from "components/styled";
import { getScheduledJobById } from "features/jobscheduler/jobschedulerSlice";
import DetailScheduledJob from "components/jobscheduler/DetailScheduledJob";
import { Loader } from "utils/utils";
import "./styles.css";

function ScheduledJobDetailView(props) {
  const { loading } = useSelector((state) => state.jobscheduler);
  const { theme } = useSelector((state) => state.home);
  const { jobId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getScheduledJobById(jobId));
  }, [dispatch, jobId]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Scheduled Job"}
          className={`display-6 mt-4 mb-4`}
          reportId={jobId}
        />
        <BackButton mb={"mb-4"} theme={theme} />
        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <DetailScheduledJob />
        )}
      </div>
    </MainLayout>
  );
}

ScheduledJobDetailView.propTypes = {};

export default ScheduledJobDetailView;
