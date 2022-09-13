import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import { BackButton } from "../../../components/errorreports/ErrorHelpers";
import ErrorReportDetail from "../../../components/errorreports/ErrorReportDetail";
import Header from "../../../components/layout/header";
import MainLayout from "../../../components/layout/main";
import { LoaderDiv } from "../../../components/styled";
import { detailErrorReport } from "../../../features/errorreport/errorreportSlice";
import { listHarvesters } from "../../../features/harvester/harvesterSlice";
import { listLocations } from "../../../features/location/locationSlice";
import { Loader, paramsToObject } from "../../../utils/utils";
import "./styles.css";

function ErrorsReportDetail(props) {
  const { loading } = useSelector((state) => state.errorreport);
  const params = useParams();
  const dispatch = useDispatch();
  const { search } = useLocation();
  const paramsObj = paramsToObject(search);

  useEffect(() => {
    (async () => {
      await Promise.all([
        dispatch(listHarvesters()),
        dispatch(listLocations()),
        dispatch(detailErrorReport(params.reportId)),
      ]);
    })();
  }, [dispatch, params]);

  return (
    <MainLayout>
      <div className="container">
        <div>
          <BackButton paramsObj={paramsObj} />
          <Header
            title={"HDS Prototype: Error Reports"}
            className={"display-6 mb-4"}
            reportId={params.reportId}
          />
        </div>

        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <ErrorReportDetail />
        )}
      </div>
    </MainLayout>
  );
}

ErrorsReportDetail.propTypes = {};

export default ErrorsReportDetail;
