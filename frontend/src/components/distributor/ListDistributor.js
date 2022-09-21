import { useSelector } from "react-redux";
import { Loader } from "../../utils/utils";
import { LoaderDiv } from "../styled";
import DistributorTable from "../tables/DistributorTable";

function ListDistributor(props) {
  const { distributors, loading } = useSelector((state) => state.distributor);
  return (
    <>
      <div className="flex-right">
        <button className="btn btn-primary">Add New Distributor</button>
      </div>
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <DistributorTable distributors={distributors} />
      )}
    </>
  );
}

ListDistributor.propTypes = {};

export default ListDistributor;
