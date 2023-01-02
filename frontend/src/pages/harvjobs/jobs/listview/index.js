import { useEffect } from "react";
import { useDispatch } from "react-redux";
import JobQuery from "components/harvjobs/jobs/JobQuery";
import ListJobs from "components/harvjobs/jobs/ListJobs";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { GenericPagination } from "components/pagination/Pagination";
import { MAX_LIMIT } from "features/base/constants";
import { listHarvesters } from "features/harvester/harvesterSlice";
import { listJobs } from "features/harvjobs/harvjobSlice";
import "./styles.css";

function JobListView(props) {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await Promise.all([
        dispatch(listJobs()),
        dispatch(listHarvesters(MAX_LIMIT)),
      ]);
    })();
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS Jobs"} className={`display-6 mt-4 mb-4`} />
        <JobQuery />
        <ListJobs />
        <GenericPagination state="harvjobs" attr="jobs" />
      </div>
    </MainLayout>
  );
}

JobListView.propTypes = {};

export default JobListView;
