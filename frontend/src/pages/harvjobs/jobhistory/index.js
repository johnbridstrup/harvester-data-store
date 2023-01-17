import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MainLayout from "components/layout/main";
import Header from "components/layout/header";
import { listJobStatus } from "features/harvjobs/harvjobSlice";
import ListJobHistory from "components/harvjobs/jobhistory/ListJobHistory";
import { GenericPagination } from "components/pagination/Pagination";
import BackButton from "components/harvjobs/helpers";
import "./styles.css";

function JobHistoryView(props) {
  const { theme } = useSelector((state) => state.home);
  const { jobId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(listJobStatus(jobId));
    })();
  }, [dispatch, jobId]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Job Status"}
          className={`display-6 mt-4 mb-4`}
          reportId={jobId}
        />
        <BackButton mb={"mb-4"} theme={theme} />
        <ListJobHistory />
        <GenericPagination state="harvjobs" attr="jobstatus" />
      </div>
    </MainLayout>
  );
}

JobHistoryView.propTypes = {};

export default JobHistoryView;
