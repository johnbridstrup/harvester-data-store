import MainLayout from "../../../components/layout/main";
import DetailHarvester from "../../../components/harvester/DetailHarvester";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getHarvesterById } from "../../../features/harvester/harvesterSlice";
import Header from "../../../components/layout/header";
import "./styles.css";
import { LoaderDiv } from "../../../components/styled";
import { Loader } from "../../../utils/utils";
import { queryErrorReport } from "../../../features/errorreport/errorreportSlice";

function HarvesterDetailView(props) {
  const { loading } = useSelector((state) => state.harvester);
  const dispatch = useDispatch();
  const { harvId } = useParams();

  useEffect(() => {
    (async () => {
      const res = await dispatch(getHarvesterById(harvId));
      await dispatch(queryErrorReport({ harv_ids: [res.payload?.harv_id] }));
    })();
  }, [dispatch, harvId]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Harvesters"}
          className={"display-6 mt-4 mb-4"}
          reportId={harvId}
        />
        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <DetailHarvester />
        )}
      </div>
    </MainLayout>
  );
}

HarvesterDetailView.propTypes = {};

export default HarvesterDetailView;
