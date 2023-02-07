import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import S3FileDetail from "components/s3files/S3FileDetail";
import { BackButton } from "components/common";
import { LoaderDiv } from "components/styled";
import { getS3FileById } from "features/s3file/s3fileSlice";
import { Loader } from "utils/utils";
import "./styles.css";

function S3FileDetailView(props) {
  const { loading } = useSelector((state) => state.s3file);
  const { theme } = useSelector((state) => state.home);
  const { s3fileId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getS3FileById(s3fileId));
  }, [s3fileId, dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS S3Files"}
          className={"display-6 mt-4 mb-4"}
          reportId={s3fileId}
        />
        <BackButton mb={"mb-4"} theme={theme} />
        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <S3FileDetail />
        )}
      </div>
    </MainLayout>
  );
}

S3FileDetailView.propTypes = {};

export default S3FileDetailView;
