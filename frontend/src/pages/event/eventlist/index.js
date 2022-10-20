import { useEffect } from "react";
import { useDispatch } from "react-redux";
import EventQuery from "../../../components/event/EventQuery";
import ListEvent from "../../../components/event/ListEvent";
import Header from "../../../components/layout/header";
import MainLayout from "../../../components/layout/main";
import { GenericPagination } from "../../../components/pagination/Pagination";
import { listEvents } from "../../../features/event/eventSlice";
import "./styles.css";

function EventListView(props) {
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      await dispatch(listEvents());
    })();
  }, [dispatch]);

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
