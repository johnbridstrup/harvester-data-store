import { useEffect } from "react";
import { useDispatch } from "react-redux";
import ListReleaseCode from "components/harvdeploy/release/ListReleaseCode";
import ReleaseQuery from "components/harvdeploy/release/ReleaseQuery";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { GenericPagination } from "components/pagination/Pagination";
import { MAX_LIMIT } from "features/base/constants";
import { listFruits } from "features/fruit/fruitSlice";
import { listRelease, listTags } from "features/harvdeploy/harvdeploySlice";
import "./styles.css";

function ReleaseCodeListView(props) {
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      await Promise.all([
        dispatch(listRelease()),
        dispatch(listFruits(MAX_LIMIT)),
        dispatch(listTags()),
      ]);
    })();
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Harvester Release Codes"}
          className={"display-6 mt-4 mb-4"}
        />
        <ReleaseQuery />
        <ListReleaseCode />
        <GenericPagination state="harvdeploy" attr="release" />
      </div>
    </MainLayout>
  );
}

ReleaseCodeListView.propTypes = {};

export default ReleaseCodeListView;
