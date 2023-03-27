import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import DetailEvent from "components/event/DetailEvent";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { getEventById } from "features/event/eventSlice";
import "./styles.css";
import { BackButton } from "components/common";

function EventDetailView(props) {
  const { eventId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getEventById(eventId));
  }, [dispatch, eventId]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Event"}
          className={"display-6 mt-4 mb-4"}
          reportId={eventId}
        />
        <BackButton mb="mb-4" />
        <DetailEvent />
      </div>
    </MainLayout>
  );
}

EventDetailView.propTypes = {};

export default EventDetailView;
