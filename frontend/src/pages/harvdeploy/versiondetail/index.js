import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MainLayout from "components/layout/main";
import Header from "components/layout/header";
import { LoaderDiv } from "components/styled";
import { Loader } from "utils/utils";
import { getVersionById } from "features/harvdeploy/harvdeploySlice";
import DetailVersionReport from "components/harvdeploy/version/DetailVersionReport";
import "./styles.css";

function VersionReportDetailView(props) {
  const { loading } = useSelector((state) => state.harvdeploy);
  const { versionId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getVersionById(versionId));
  }, [dispatch, versionId]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Harvester Version Report"}
          className={"display-6 mt-4 mb-4"}
          reportId={versionId}
        />

        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <DetailVersionReport />
        )}
      </div>
    </MainLayout>
  );
}

VersionReportDetailView.propTypes = {};

export default VersionReportDetailView;
