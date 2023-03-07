import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { BackButton } from "components/common";
import { getPickSessionById } from "features/event/eventSlice";
import PickSessionDetail from "components/event/PickSessionDetail";
import "./styles.css";

function PickSessionDetailView(props) {
  const { theme } = useSelector((state) => state.home);
  const { picksessionId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPickSessionById(picksessionId));
  }, [dispatch, picksessionId]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS PickSession"}
          className={"display-6 mt-4 mb-4"}
          reportId={picksessionId}
        />
        <BackButton mb="mb-4" theme={theme} />
        <PickSessionDetail />
      </div>
    </MainLayout>
  );
}

PickSessionDetailView.propTypes = {};

export default PickSessionDetailView;
