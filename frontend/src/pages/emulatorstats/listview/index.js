import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import MainLayout from "components/layout/main";
import Header from "components/layout/header";
import EmulatorstatsList from "components/emulatorstats/EmulatorstatsList";
import EmulatorstatsQuery from "components/emulatorstats/EmulatorstatsQuery";
import {
  getEmulatorstatsTags,
  queryEmulatorstats,
} from "features/emulatorstats/emulatorstatsSlice";
import { GenericPagination } from "components/pagination/Pagination";
import { paramsToObject } from "utils/utils";
import "./styles.css";

function EmulatorstatsListView(props) {
  const dispatch = useDispatch();
  const { search } = useLocation();

  useEffect(() => {
    dispatch(queryEmulatorstats(paramsToObject(search)));
    dispatch(getEmulatorstatsTags());
  }, [dispatch, search]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Emulator Statistics"}
          className={"display-6 mt-4 mb-4"}
        />
        <EmulatorstatsQuery />
        <EmulatorstatsList />
        <GenericPagination state="emulatorstats" />
      </div>
    </MainLayout>
  );
}

EmulatorstatsListView.propTypes = {};

export default EmulatorstatsListView;
