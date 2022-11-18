import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import DetailReleaseCode from "../../../components/harvdeploy/release/DetailReleaseCode";
import Header from "../../../components/layout/header";
import MainLayout from "../../../components/layout/main";
import { LoaderDiv } from "../../../components/styled";
import {
  getReleaseById,
  installedHarvesters,
  listTags,
} from "../../../features/harvdeploy/harvdeploySlice";
import { Loader } from "../../../utils/utils";
import "./styles.css";

function ReleaseCodeDetailView(props) {
  const { loading } = useSelector((state) => state.harvdeploy);
  const dispatch = useDispatch();
  const { releaseId } = useParams();
  useEffect(() => {
    (async () => {
      await Promise.all([
        dispatch(getReleaseById(releaseId)),
        dispatch(installedHarvesters(releaseId)),
        dispatch(listTags()),
      ]);
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

        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <DetailReleaseCode />
        )}
      </div>
    </MainLayout>
  );
}

ReleaseCodeDetailView.propTypes = {};

export default ReleaseCodeDetailView;
