import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { GenericPagination } from "components/pagination/Pagination";
import S3FileList from "components/s3files/S3FileList";
import S3FileQuery from "components/s3files/S3FileQuery";
import { queryS3File } from "features/s3file/s3fileSlice";
import { getEventTags } from "features/event/eventSlice";
import { paramsToObject } from "utils/utils";
import "./styles.css";

function S3FileListView(props) {
  const dispatch = useDispatch();
  const { search } = useLocation();
  const paramsObj = paramsToObject(search);

  useEffect(() => {
    dispatch(queryS3File({ deleted: false, ...paramsObj }));
    dispatch(getEventTags());
  }, [dispatch, paramsObj]);

  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS S3Files"} className={"display-6 mt-4 mb-4"} />
        <S3FileQuery />
        <S3FileList />
        <GenericPagination state="s3file" />
      </div>
    </MainLayout>
  );
}

S3FileListView.propTypes = {};

export default S3FileListView;
