import { useParams } from "react-router-dom";
import MainLayout from "../../../components/layout/main";
import Header from "../../../components/layout/header";
import "./styles.css";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { listJobStatus } from "../../../features/harvjobs/harvjobSlice";
import ListJobHistory from "../../../components/harvjobs/jobhistory/ListJobHistory";
import { GenericPagination } from "../../../components/pagination/Pagination";
import BackButton from "../../../components/harvjobs/helpers";

function JobHistoryView(props) {
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
        <BackButton mb={"mb-4"} route={"jobscheduler"} />
        <ListJobHistory />
        <GenericPagination state="harvjobs" attr="jobstatus" />
      </div>
    </MainLayout>
  );
}

JobHistoryView.propTypes = {};

export default JobHistoryView;
