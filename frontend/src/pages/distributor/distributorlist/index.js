import { useEffect } from "react";
import { useDispatch } from "react-redux";
import ListDistributor from "components/distributor/ListDistributor";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { GenericPagination } from "components/pagination/Pagination";
import { listDistributors } from "features/distributor/distributorSlice";
import "./styles.css";

function DistributorListView(props) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listDistributors());
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header title={"HDS Distributors"} className={"display-6 mt-4 mb-4"} />
        <ListDistributor />
        <GenericPagination state="distributor" />
      </div>
    </MainLayout>
  );
}

DistributorListView.propTypes = {};

export default DistributorListView;
