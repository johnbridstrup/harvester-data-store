import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import JobQuery from "components/harvjobs/jobs/JobQuery";
import ListJobs from "components/harvjobs/jobs/ListJobs";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { GenericPagination } from "components/pagination/Pagination";
import { MAX_LIMIT } from "features/base/constants";
import { listHarvesters } from "features/harvester/harvesterSlice";
import { queryJobs } from "features/harvjobs/harvjobSlice";
import { paramsToObject } from "utils/utils";
import "./styles.css";

function JobListView(props) {
  const dispatch = useDispatch();
  const { search } = useLocation();

  useEffect(() => {
    (async () => {
      await Promise.all([
        dispatch(queryJobs(paramsToObject(search))),
        dispatch(listHarvesters(MAX_LIMIT)),
      ]);
    })();
  }, [dispatch, search]);

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
