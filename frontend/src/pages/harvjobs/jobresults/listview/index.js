import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import BackButton from "components/harvjobs/helpers";
import ListJobResults from "components/harvjobs/jobresults/ListJobResults";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { GenericPagination } from "components/pagination/Pagination";
import {
  listJobResults,
  queryJobResults,
} from "features/harvjobs/harvjobSlice";
import { paramsToObject } from "utils/utils";
import "./styles.css";

function JobResultListView(props) {
  const { search } = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      if (search) {
        const paramsObj = paramsToObject(search);
        await dispatch(queryJobResults(paramsObj));
      } else {
        await dispatch(listJobResults());
      }
    })();
  }, [dispatch, search]);

  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS Job Results"} className={`display-6 mt-4 mb-4`} />
        <BackButton mb={"mb-4"} />
        <ListJobResults />
        <GenericPagination state="harvjobs" attr="jobresults" />
      </div>
    </MainLayout>
  );
}

JobResultListView.propTypes = {};

export default JobResultListView;
