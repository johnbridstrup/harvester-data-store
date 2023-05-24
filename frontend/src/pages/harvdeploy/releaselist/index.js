import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import ListReleaseCode from "components/harvdeploy/release/ListReleaseCode";
import ReleaseQuery from "components/harvdeploy/release/ReleaseQuery";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { GenericPagination } from "components/pagination/Pagination";
import { MAX_LIMIT } from "features/base/constants";
import { listFruits } from "features/fruit/fruitSlice";
import { queryRelease, listTags } from "features/harvdeploy/harvdeploySlice";
import { paramsToObject } from "utils/utils";
import "./styles.css";

function ReleaseCodeListView(props) {
  const dispatch = useDispatch();
  const { search } = useLocation();

  useEffect(() => {
    (async () => {
      dispatch(queryRelease(paramsToObject(search)));
      await Promise.all([
        dispatch(listFruits(MAX_LIMIT)),
        dispatch(listTags()),
      ]);
    })();
  }, [dispatch, search]);

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
