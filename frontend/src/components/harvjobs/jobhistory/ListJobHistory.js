import { useSelector } from "react-redux";
import { Loader } from "utils/utils";
import { LoaderDiv } from "components/styled";
import { JobStatusHistory } from "../helpers";

function ListJobHistory(props) {
  const { jobstatuses, loading } = useSelector((state) => state.harvjobs);
  return (
    <>
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <JobStatusHistory jobstatuses={jobstatuses} />
      )}
    </>
  );
}

ListJobHistory.propTypes = {};

export default ListJobHistory;
