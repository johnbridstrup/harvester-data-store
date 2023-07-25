import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import MainLayout from "components/layout/main";
import Header from "components/layout/header";
import { BackButton } from "components/common";
import { LoaderDiv } from "components/styled";
import { Loader, paramsToObject } from "utils/utils";
import {
  getEmulatorstatsTags,
  queryEmulatorstats,
} from "features/emulatorstats/emulatorstatsSlice";
import EmulatorstatsChart from "components/emulatorstats/EmulatorstatsChart";
import EmulatorstatsQuery from "components/emulatorstats/EmulatorstatsQuery";
import { CopyGenericURL } from "components/copytoclipboard/CopyToClipboard";
import "./styles.css";

function EmulatorstatsChartView(props) {
  const { loading } = useSelector((state) => state.emulatorstats);
  const { theme } = useSelector((state) => state.home);
  const dispatch = useDispatch();
  const { search } = useLocation();

  useEffect(() => {
    // default to limit stats by 1000 entries
    // this can change for dynamic implementation
    dispatch(queryEmulatorstats({  ...paramsToObject(search), limit: 1000  }));
    dispatch(getEmulatorstatsTags());
  }, [dispatch, search]);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Emulator Stats Chart"}
          className={"display-6 mt-4 mb-4"}
        />
        <BackButton theme={theme} mb={"mb-4"} />

        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <>
            <EmulatorstatsQuery view="chartview" />
            <EmulatorstatsChart />
            <CopyGenericURL
              paramsObj={paramsToObject(search)}
              theme={theme}
              state="emucharts"
            />
          </>
        )}
      </div>
    </MainLayout>
  );
}

EmulatorstatsChartView.propTypes = {};

export default EmulatorstatsChartView;
