import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import DetailReleaseCode from "../../../components/harvdeploy/release/DetailReleaseCode";
import Header from "../../../components/layout/header";
import MainLayout from "../../../components/layout/main";
import { getReleaseById } from "../../../features/harvdeploy/releaseSlice";

function ReleaseCodeDetailView(props) {
  const dispatch = useDispatch();
  const { releaseId } = useParams();
  useEffect(() => {
    (async () => {
      await dispatch(getReleaseById(releaseId));
    })();
  }, [releaseId, dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Harvester Release Codes"}
          className={"display-6 mt-4 mb-4"}
          reportId={releaseId}
        />

        <DetailReleaseCode />
      </div>
    </MainLayout>
  );
}

ReleaseCodeDetailView.propTypes = {};

export default ReleaseCodeDetailView;
