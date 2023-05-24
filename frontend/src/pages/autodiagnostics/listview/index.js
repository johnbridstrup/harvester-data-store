import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import AutodiagList from "components/autodiagnostics/AutodiagList";
import AutodiagQuery from "components/autodiagnostics/AutodiagQuery";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import { GenericPagination } from "components/pagination/Pagination";
import { queryAutodiagReport } from "features/autodiagnostics/autodiagnosticSlice";
import { MAX_LIMIT } from "features/base/constants";
import { listHarvesters } from "features/harvester/harvesterSlice";
import { listLocations } from "features/location/locationSlice";
import { paramsToObject } from "utils/utils";
import "./styles.css";

function AutodiagnosticListView(props) {
  const dispatch = useDispatch();
  const { search } = useLocation();

  useEffect(() => {
    (async () => {
      dispatch(queryAutodiagReport(paramsToObject(search)));
      await Promise.all([
        dispatch(listHarvesters(MAX_LIMIT)),
        dispatch(listLocations(MAX_LIMIT)),
      ]);
    })();
  }, [dispatch, search]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Autodiagnostics Report"}
          className={"display-6 mt-4 mb-4"}
        />
        <AutodiagQuery />
        <AutodiagList />
        <GenericPagination state="autodiagnostic" />
      </div>
    </MainLayout>
  );
}

AutodiagnosticListView.propTypes = {};

export default AutodiagnosticListView;
