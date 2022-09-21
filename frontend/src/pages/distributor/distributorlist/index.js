import { useEffect } from "react";
import { useDispatch } from "react-redux";
import ListDistributor from "../../../components/distributor/ListDistributor";
import Header from "../../../components/layout/header";
import MainLayout from "../../../components/layout/main";
import { listDistributors } from "../../../features/distributor/distributorSlice";
import "./styles.css";

function DistributorListView(props) {
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      await dispatch(listDistributors());
    })();
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS Distributors"} className={"display-6 mt-4 mb-4"} />
        <ListDistributor />
      </div>
    </MainLayout>
  );
}

DistributorListView.propTypes = {};

export default DistributorListView;
