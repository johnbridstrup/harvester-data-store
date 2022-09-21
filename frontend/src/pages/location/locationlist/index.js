import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Header from "../../../components/layout/header";
import MainLayout from "../../../components/layout/main";
import ListLocation from "../../../components/location/ListLocation";
import { MAX_LIMIT } from "../../../features/base/constants";
import { listDistributors } from "../../../features/distributor/distributorSlice";
import { listLocations } from "../../../features/location/locationSlice";
import "./styles.css";

function LocationListView(props) {
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      await Promise.all([
        dispatch(listLocations()),
        dispatch(listDistributors(MAX_LIMIT)),
      ]);
    })();
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS Locations"} className={"display-6 mt-4 mb-4"} />
        <ListLocation />
      </div>
    </MainLayout>
  );
}

LocationListView.propTypes = {};

export default LocationListView;
