import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MainLayout from "../../../../components/layout/main";
import Header from "../../../../components/layout/header";
import { getJobSchemaById } from "../../../../features/harvjobs/harvjobSlice";
import DetailJobSchemas from "../../../../components/harvjobs/jobschemas/DetailJobSchemas";
import { LoaderDiv } from "../../../../components/styled";
import { Loader } from "../../../../utils/utils";
import "./styles.css";
import BackButton from "../../../../components/harvjobs/helpers";

function JobSchemaDetailView(props) {
  const { loading } = useSelector((state) => state.harvjobs);
  const { jobschemaId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(getJobSchemaById(jobschemaId));
    })();
  }, [dispatch, jobschemaId]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Job Schemas"}
          className={`display-6 mt-4 mb-4`}
          reportId={jobschemaId}
        />
        <BackButton mb={"mb-4"} />
        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <DetailJobSchemas />
        )}
      </div>
    </MainLayout>
  );
}

JobSchemaDetailView.propTypes = {};

export default JobSchemaDetailView;
