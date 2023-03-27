import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import MainLayout from "components/layout/main";
import Header from "components/layout/header";
import DetailHarvesterHistory from "components/harvester/DetailHarvesterHistory";
import { LoaderDiv } from "components/styled";
import { Loader } from "utils/utils";
import { getHarvHistoryById } from "features/harvester/harvesterSlice";
import "./styles.css";

function HarvesterHistoryDetailView(props) {
  const { loading } = useSelector((state) => state.harvester);
  const { historyId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getHarvHistoryById(historyId));
  }, [dispatch, historyId]);
  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Harvesters History"}
          className={"display-6 mt-4 mb-4"}
          reportId={historyId}
        />
        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <DetailHarvesterHistory />
        )}
      </div>
    </MainLayout>
  );
}

HarvesterHistoryDetailView.propTypes = {};

export default HarvesterHistoryDetailView;
