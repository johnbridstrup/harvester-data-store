import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "components/layout/main";
import Header from "components/layout/header";
import {
  listHarvesterHistory,
  queryHarvHistory,
} from "features/harvester/harvesterSlice";
import ListHarvesterHistory from "components/harvester/ListHarvesterHistory";
import { paramsToObject } from "utils/utils";
import { GenericPagination } from "components/pagination/Pagination";
import "./styles.css";

function HarvesterHistoryListView(props) {
  const dispatch = useDispatch();
  const { search } = useLocation();

  useEffect(() => {
    (async () => {
      if (search) {
        const paramsObj = paramsToObject(search);
        await dispatch(queryHarvHistory(paramsObj));
      } else {
        await dispatch(listHarvesterHistory());
      }
    })();
  }, [dispatch, search]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Harvesters History"}
          className={"display-6 mt-4 mb-4"}
        />

        <ListHarvesterHistory />
        <GenericPagination state="harvester" attr="historys" />
      </div>
    </MainLayout>
  );
}

HarvesterHistoryListView.propTypes = {};

export default HarvesterHistoryListView;
