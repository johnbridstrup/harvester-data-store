import { useEffect } from "react";
import { useDispatch } from "react-redux";
import MainLayout from "components/layout/main";
import Header from "components/layout/header";
import ListScheduledJobs from "components/jobscheduler/ListScheduledJobs";
import { queryScheduledJobs } from "features/jobscheduler/jobschedulerSlice";
import { GenericPagination } from "components/pagination/Pagination";
import "./styles.css";

function ScheduledJobListView(props) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(queryScheduledJobs({}));
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS Scheduled Job"} className={`display-6 mt-4 mb-4`} />
        <ListScheduledJobs />
        <GenericPagination state="jobscheduler" />
      </div>
    </MainLayout>
  );
}

ScheduledJobListView.propTypes = {};

export default ScheduledJobListView;
