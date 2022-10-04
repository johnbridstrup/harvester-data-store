import { useEffect } from "react";
import { useDispatch } from "react-redux";
import ListReleaseCode from "../../../components/harvdeploy/release/ListReleaseCode";
import Header from "../../../components/layout/header";
import MainLayout from "../../../components/layout/main";
import { GenericPagination } from "../../../components/pagination/Pagination";
import { listRelease } from "../../../features/harvdeploy/releaseSlice";
import "./styles.css";

function ReleaseCodeListView(props) {
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      await dispatch(listRelease());
    })();
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Harvester Release Codes"}
          className={"display-6 mt-4 mb-4"}
        />
        <ListReleaseCode />
        <GenericPagination state="release" />
      </div>
    </MainLayout>
  );
}

ReleaseCodeListView.propTypes = {};

export default ReleaseCodeListView;
