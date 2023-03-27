import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import MigrationList from "components/migration/MigrationList";
import { listMigrationLogs } from "features/migration/migrationSlice";
import { GenericPagination } from "components/pagination/Pagination";
import "./styles.css";

function MigrationListView(props) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(listMigrationLogs());
  }, [dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Migration Logs"}
          className={"display-6 mt-4 mb-4"}
        />
        <MigrationList />
        <GenericPagination state="migration" />
      </div>
    </MainLayout>
  );
}

MigrationListView.propTypes = {};

export default MigrationListView;
