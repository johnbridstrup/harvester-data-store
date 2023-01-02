import { useEffect } from "react";
import { useDispatch } from "react-redux";
import BackButton from "components/harvjobs/helpers";
import ListJobTypes from "components/harvjobs/jobtypes/ListJobTypes";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { GenericPagination } from "components/pagination/Pagination";
import { listJobTypes } from "features/harvjobs/harvjobSlice";
import "./styles.css";

function JobTypeListView(props) {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(listJobTypes());
    })();
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS JobTypes"} className={`display-6 mt-4 mb-4`} />
        <BackButton />
        <ListJobTypes />
        <GenericPagination state="harvjobs" />
      </div>
    </MainLayout>
  );
}

JobTypeListView.propTypes = {};

export default JobTypeListView;
