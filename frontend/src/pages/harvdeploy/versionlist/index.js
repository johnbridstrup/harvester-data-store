import { useEffect } from "react";
import { useDispatch } from "react-redux";
import MainLayout from "components/layout/main";
import Header from "components/layout/header";
import ListVersionReport from "components/harvdeploy/version/ListVersionReport";
import { listVersion } from "features/harvdeploy/harvdeploySlice";
import { GenericPagination } from "components/pagination/Pagination";
import "./styles.css";

function VersionReportListView(props) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(listVersion());
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Harvester Version Report"}
          className={"display-6 mt-4 mb-4"}
        />
        <ListVersionReport />
        <GenericPagination state="harvdeploy" />
      </div>
    </MainLayout>
  );
}

VersionReportListView.propTypes = {};

export default VersionReportListView;
