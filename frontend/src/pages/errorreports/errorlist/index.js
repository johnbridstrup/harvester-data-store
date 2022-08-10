import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import MainLayout from "../../../components/layout/main";
import ErrorReportQuery from "../../../components/errorreports/ErrorReportQuery";
import ErrorReportTable from "../../../components/errorreports/ErrorReportTable";
import { listHarvesters } from "../../../features/harvester/harvesterSlice";
import { listLocations } from "../../../features/location/locationSlice";
import {
  copyQueryUrl,
  errorreportListView,
  queryErrorReport,
} from "../../../features/errorreport/errorreportSlice";
import Pagination from "../../../components/pagination/Pagination";
import "./styles.css";
import { copiedUrl, paramsToObject } from "../../../utils/utils";
import CopyToClipboard from "../../../components/copytoclipboard/CopyToClipboard";

function ErrorsReportList(props) {
  const dispatch = useDispatch();
  const { search } = useLocation();

  useEffect(() => {
    (async () => {
      await Promise.all([
        dispatch(listHarvesters()),
        dispatch(listLocations()),
      ]);
    })();
    if (search) {
      const paramsObj = paramsToObject(search);
      (async () => {
        await dispatch(queryErrorReport(paramsObj));
        dispatch(copyQueryUrl(copiedUrl(paramsObj)));
      })();
    } else {
      (async () => {
        await dispatch(errorreportListView());
      })();
    }
    return () => {};
  }, [dispatch, search]);

  return (
    <MainLayout>
      <div className="container">
        <div>
          <div className="display-6 mt-4 mb-4">
            HDS Prototype: Error Reports
          </div>
        </div>
        <ErrorReportQuery />
        <ErrorReportTable />
        <Pagination />
        <CopyToClipboard />
      </div>
    </MainLayout>
  );
}

ErrorsReportList.propTypes = {};

export default ErrorsReportList;
