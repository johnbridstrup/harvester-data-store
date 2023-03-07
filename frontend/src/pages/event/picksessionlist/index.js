import { useEffect } from "react";
import { useDispatch } from "react-redux";
import PickSessionList from "components/event/PickSessionList";
import PickSessionQuery from "components/event/PickSessionQuery";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { queryPickSession } from "features/event/eventSlice";
import { GenericPagination } from "components/pagination/Pagination";
import "./styles.css";

function PickSessionListView(props) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(queryPickSession());
  }, [dispatch]);

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
