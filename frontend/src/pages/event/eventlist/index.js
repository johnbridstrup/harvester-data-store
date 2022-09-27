import { useEffect } from "react";
import { useDispatch } from "react-redux";
import ListEvent from "../../../components/event/ListEvent";
import Header from "../../../components/layout/header";
import MainLayout from "../../../components/layout/main";
import { EventPagination } from "../../../components/pagination/Pagination";
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

        <ListEvent />
        <EventPagination />
      </div>
    </MainLayout>
  );
}

EventListView.propTypes = {};

export default EventListView;
