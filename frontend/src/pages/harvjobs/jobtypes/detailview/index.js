import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import BackButton from "components/harvjobs/helpers";
import DetailJobTypes from "components/harvjobs/jobtypes/DetailJobTypes";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { LoaderDiv } from "components/styled";
import { getJobTypeById } from "features/harvjobs/harvjobSlice";
import { Loader } from "utils/utils";
import "./styles.css";

function JobTypeDetailView(props) {
  const { loading } = useSelector((state) => state.harvjobs);
  const { jobtypeId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(getJobTypeById(jobtypeId));
    })();
  }, [dispatch, jobtypeId]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={`HDS JobTypes`}
          className={`display-6 mt-4 mb-4`}
          reportId={jobtypeId}
        />
        <BackButton mb={"mb-4"} />
        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <DetailJobTypes />
        )}
      </div>
    </MainLayout>
  );
}

JobTypeDetailView.propTypes = {};

export default JobTypeDetailView;
