import { useSelector } from "react-redux";
import { Loader } from "utils/utils";
import { LoaderDiv } from "components/styled";
import { JobStatusHistory } from "../helpers";

function ListJobHistory(props) {
  const { jobstatuses, loading } = useSelector((state) => state.harvjobs);
  const { theme } = useSelector((state) => state.home);
  return (
    <>
      {loading ? (
        <LoaderDiv>
          <Loader size={50} />
        </LoaderDiv>
      ) : (
        <JobStatusHistory jobstatuses={jobstatuses} theme={theme} />
      )}
    </>
  );
}

ListJobHistory.propTypes = {};

export default ListJobHistory;
