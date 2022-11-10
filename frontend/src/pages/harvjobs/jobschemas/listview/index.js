import MainLayout from "../../../../components/layout/main";
import Header from "../../../../components/layout/header";
import "./styles.css";
import ListJobSchemas from "../../../../components/harvjobs/jobschemas/ListJobSchemas";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import {
  listJobSchemas,
  listJobTypes,
} from "../../../../features/harvjobs/harvjobSlice";
import { MAX_LIMIT } from "../../../../features/base/constants";
import { GenericPagination } from "../../../../components/pagination/Pagination";
import BackButton from "../../../../components/harvjobs/helpers";

function JobSchemaListVIew(props) {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await Promise.all([
        dispatch(listJobTypes(MAX_LIMIT)),
        dispatch(listJobSchemas()),
      ]);
    })();
  }, [dispatch]);
  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS Job Schemas"} className={`display-6 mt-4 mb-4`} />
        <BackButton />
        <ListJobSchemas />
        <GenericPagination state="harvjobs" />
      </div>
    </MainLayout>
  );
}

JobSchemaListVIew.propTypes = {};

export default JobSchemaListVIew;
