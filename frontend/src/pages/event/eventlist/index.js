import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import EventQuery from "components/event/EventQuery";
import ListEvent from "components/event/ListEvent";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { GenericPagination } from "components/pagination/Pagination";
import { queryEvent } from "features/event/eventSlice";
import { paramsToObject } from "utils/utils";
import "./styles.css";

function EventListView(props) {
  const dispatch = useDispatch();
  const { search } = useLocation();

  useEffect(() => {
    dispatch(queryEvent(paramsToObject(search)));
  }, [dispatch, search]);

  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS Events"} className={"display-6 mt-4 mb-4"} />
        <EventQuery />
        <ListEvent />
        <GenericPagination state="event" />
      </div>
    </MainLayout>
  );
}

EventListView.propTypes = {};

export default EventListView;
