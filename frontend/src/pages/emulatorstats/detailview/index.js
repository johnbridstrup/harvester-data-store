import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import MainLayout from "components/layout/main";
import Header from "components/layout/header";
import { LoaderDiv } from "components/styled";
import { Loader } from "utils/utils";
import EmulatorstatsDetail from "components/emulatorstats/EmulatorstatsDetail";
import { BackButton } from "components/common";
import { getEmulatorstatsById } from "features/emulatorstats/emulatorstatsSlice";
import "./styles.css";

function EmulatorstatsDetailView(props) {
  const { loading } = useSelector((state) => state.emulatorstats);
  const { theme } = useSelector((state) => state.home);
  const dispatch = useDispatch();
  const { emustatsId } = useParams();

  useEffect(() => {
    dispatch(getEmulatorstatsById(emustatsId));
  }, [dispatch, emustatsId]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Emulator Statistics"}
          className={"display-6 mt-4 mb-4"}
          reportId={emustatsId}
        />
        <BackButton theme={theme} mb={"mb-4"} />

        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <EmulatorstatsDetail />
        )}
      </div>
    </MainLayout>
  );
}

EmulatorstatsDetailView.propTypes = {};

export default EmulatorstatsDetailView;
