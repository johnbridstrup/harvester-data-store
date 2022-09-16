import { useEffect } from "react";
import { useDispatch } from "react-redux";
import ListHarvester from "../../../components/harvester/ListHarvester";
import Header from "../../../components/layout/header";
import MainLayout from "../../../components/layout/main";
import { listHarvesters } from "../../../features/harvester/harvesterSlice";
import "./styles.css";

function HarvesterListView(props) {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(listHarvesters());
    })();
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS Harvesters"} className={"display-6 mt-4 mb-4"} />
        <ListHarvester />
      </div>
    </MainLayout>
  );
}

HarvesterListView.propTypes = {};

export default HarvesterListView;
