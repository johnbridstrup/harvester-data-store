import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import ListHarvVersion from "../../../components/harvester/ListHarvVersion";
import Header from "../../../components/layout/header";
import MainLayout from "../../../components/layout/main";
import { GenericPagination } from "../../../components/pagination/Pagination";
import { listHarvVersion } from "../../../features/harvester/harvesterSlice";
import "./styles.css";

function HarvVersionListView(props) {
  const { harvId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(listHarvVersion({ harvId }));
    })();
  }, [dispatch, harvId]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Harvester Version"}
          className={"display-6 mt-4 mb-4"}
        />
        <ListHarvVersion />
        <GenericPagination state="harvester" attr="harvversion" />
      </div>
    </MainLayout>
  );
}

HarvVersionListView.propTypes = {};

export default HarvVersionListView;
