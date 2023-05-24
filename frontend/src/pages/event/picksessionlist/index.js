import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import PickSessionList from "components/event/PickSessionList";
import PickSessionQuery from "components/event/PickSessionQuery";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import {
  getPickSessionTags,
  queryPickSession,
} from "features/event/eventSlice";
import { GenericPagination } from "components/pagination/Pagination";
import { listHarvesters } from "features/harvester/harvesterSlice";
import { MAX_LIMIT } from "features/base/constants";
import { listLocations } from "features/location/locationSlice";
import { paramsToObject } from "utils/utils";
import "./styles.css";

function PickSessionListView(props) {
  const dispatch = useDispatch();
  const { search } = useLocation();

  useEffect(() => {
    dispatch(queryPickSession(paramsToObject(search)));
    (async () => {
      await Promise.all([
        dispatch(listHarvesters(MAX_LIMIT)),
        dispatch(listLocations(MAX_LIMIT)),
        dispatch(getPickSessionTags()),
      ]);
    })();
  }, [dispatch, search]);

  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS PickSessions"} className={"display-6 mt-4 mb-4"} />
        <PickSessionQuery />
        <PickSessionList />
        <GenericPagination state="event" attr="picksession" />
      </div>
    </MainLayout>
  );
}

PickSessionListView.propTypes = {};

export default PickSessionListView;
