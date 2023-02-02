import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import MainLayout from "components/layout/main";
import ErrorReportQuery from "components/errorreports/ErrorReportQuery";
import ErrorReportTable from "components/errorreports/ErrorReportTable";
import { listHarvesters } from "features/harvester/harvesterSlice";
import { listLocations } from "features/location/locationSlice";
import {
  copyQueryUrl,
  queryErrorReport,
} from "features/errorreport/errorreportSlice";
import Pagination from "components/pagination/Pagination";
import { copiedUrl, paramsToObject } from "utils/utils";
import CopyToClipboard from "components/copytoclipboard/CopyToClipboard";
import { MAX_LIMIT } from "features/base/constants";
import { listFruits } from "features/fruit/fruitSlice";
import { listCodes } from "features/excecode/codeSlice";
import Header from "components/layout/header";
import { listUsers } from "features/user/userSlice";
import "./styles.css";

function ErrorsReportList(props) {
  const dispatch = useDispatch();
  const { search } = useLocation();

  useEffect(() => {
    (async () => {
      await Promise.all([
        dispatch(listHarvesters(MAX_LIMIT)),
        dispatch(listLocations(MAX_LIMIT)),
        dispatch(listFruits(MAX_LIMIT)),
        dispatch(listCodes(MAX_LIMIT)),
        dispatch(listUsers(MAX_LIMIT)),
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
        await dispatch(queryErrorReport({ is_emulator: 0 }));
      })();
    }
    return () => {};
  }, [dispatch, search]);

  return (
    <MainLayout>
      <div className="container">
        <div>
          <Header
            title={"HDS Prototype: Error Reports"}
            className={"display-6 mt-4 mb-4"}
          />
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
