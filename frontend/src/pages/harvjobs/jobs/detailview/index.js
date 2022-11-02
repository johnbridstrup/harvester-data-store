import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import BackButton from "../../../../components/harvjobs/helpers";
import DetailJob from "../../../../components/harvjobs/jobs/DetailJob";
import Header from "../../../../components/layout/header";
import MainLayout from "../../../../components/layout/main";
import { LoaderDiv } from "../../../../components/styled";
import { getJobById } from "../../../../features/harvjobs/harvjobSlice";
import { Loader } from "../../../../utils/utils";

function JobDetailView(props) {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.harvjobs);

  useEffect(() => {
    (async () => {
      await dispatch(getJobById(jobId));
    })();
  }, [dispatch, jobId]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Jobs"}
          className={`display-6 mt-4 mb-4`}
          reportId={jobId}
        />
        <BackButton mb={"mb-4"} route={"jobs"} />
        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <DetailJob />
        )}
      </div>
    </MainLayout>
  );
}

JobDetailView.propTypes = {};

export default JobDetailView;
