import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import AutodiagnosticDetail from "components/autodiagnostics/AutodiagnosticDetail";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { LoaderDiv } from "components/styled";
import { Loader, timeStampFormat } from "utils/utils";
import { getAutodiagReport } from "features/autodiagnostics/autodiagnosticSlice";
import { BackButton, DownloadButton } from "components/common";
import DownloadModal from "components/modals/DownloadModal";
import "./styles.css";

function AutodiagnosticDetailView(props) {
  const { loading, report } = useSelector((state) => state.autodiagnostic);
  const { timezone } = useSelector((state) => state.errorreport);
  const { theme } = useSelector((state) => state.home);
  const { reportId } = useParams();
  const dispatch = useDispatch();
  const downloadRef = useRef();

  useEffect(() => {
    dispatch(getAutodiagReport(reportId));
  }, [reportId, dispatch]);

  const modalPopUp = () => {
    downloadRef.current.click();
  };

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={`Autodiagnostics: Harv ${report.harvester?.harv_id} Robot ${
            report.robot
          } (${timeStampFormat(report.reportTime, timezone)})`}
          className={"display-6 mt-4 mb-4"}
        />
        <BackButton theme={theme} mb={"mb-4"} />
        <DownloadButton
          downloadRef={downloadRef}
          popUp={modalPopUp}
          theme={theme}
        />
        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <AutodiagnosticDetail />
        )}
        <DownloadModal eventObj={report.event} theme={theme} />
      </div>
    </MainLayout>
  );
}

AutodiagnosticDetailView.propTypes = {};

export default AutodiagnosticDetailView;
