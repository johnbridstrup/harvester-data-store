import { useEffect } from "react";
import { useDispatch } from "react-redux";
import ListHarvester from "../../../components/harvester/ListHarvester";
import Header from "../../../components/layout/header";
import MainLayout from "../../../components/layout/main";
import { GenericPagination } from "../../../components/pagination/Pagination";
import { MAX_LIMIT } from "../../../features/base/constants";
import { listFruits } from "../../../features/fruit/fruitSlice";
import { listHarvesters } from "../../../features/harvester/harvesterSlice";
import { listLocations } from "../../../features/location/locationSlice";
import "./styles.css";

function HarvesterListView(props) {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await Promise.all([
        dispatch(listHarvesters()),
        dispatch(listFruits(MAX_LIMIT)),
        dispatch(listLocations(MAX_LIMIT)),
      ]);
    })();
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS Harvesters"} className={"display-6 mt-4 mb-4"} />
        <ListHarvester />
        <GenericPagination state="harvester" />
      </div>
    </MainLayout>
  );
}

HarvesterListView.propTypes = {};

export default HarvesterListView;
