import Header from "components/layout/header";
import MainLayout from "components/layout/main";
import MigrationDetail from "components/migration/MigrationDetail";
import { BackButton } from "components/common";
import { LoaderDiv } from "components/styled";
import { getMigrationLogById } from "features/migration/migrationSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Loader } from "utils/utils";
import "./styles.css";

function MigrationDetailView(props) {
  const { loading } = useSelector((state) => state.migration);
  const dispatch = useDispatch();
  const { migrationId } = useParams();

  useEffect(() => {
    (async () => {
      await dispatch(getMigrationLogById(migrationId));
    })();
  }, [migrationId, dispatch]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Migration Log"}
          className={"display-6 mt-4 mb-4"}
          reportId={migrationId}
        />
        <BackButton mb="mb-4" />
        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <MigrationDetail />
        )}
      </div>
    </MainLayout>
  );
}

MigrationDetailView.propTypes = {};

export default MigrationDetailView;
