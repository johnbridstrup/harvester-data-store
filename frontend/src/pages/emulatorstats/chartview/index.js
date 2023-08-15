import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import MainLayout from "components/layout/main";
import Header from "components/layout/header";
import { CustomBackButton } from "components/common";
import { LoaderDiv } from "components/styled";
import { Loader, handleSelectFactory, paramsToObject } from "utils/utils";
import {
  getEmulatorstatsTags,
  queryEmulatorstats,
} from "features/emulatorstats/emulatorstatsSlice";
import EmulatorstatsChart from "components/emulatorstats/EmulatorstatsChart";
import EmulatorstatsQuery from "components/emulatorstats/EmulatorstatsQuery";
import EmulatorstatsSeries from "components/emulatorstats/EmulatorstatsSeries";
import { CopyGenericURL } from "components/copytoclipboard/CopyToClipboard";
import { SelectChart } from "components/emulatorstats/EmulatorstatsHelpers";
import "./styles.css";

function EmulatorstatsChartView(props) {
  const [selectedChart, setSelectedChart] = useState({
    value: "Default Chart",
    label: "Default Chart",
  });
  const { loading } = useSelector((state) => state.emulatorstats);
  const { theme } = useSelector((state) => state.home);
  const dispatch = useDispatch();
  const { search } = useLocation();
  const chartOptions = [
    { label: "Default Chart", value: "Default Chart" },
    { label: "Time Series Chart", value: "Time Series Chart" },
  ];

  useEffect(() => {
    // default to limit stats by 1000 entries
    // this can change for dynamic implementation
    dispatch(queryEmulatorstats({ ...paramsToObject(search), limit: 1000 }));
    dispatch(getEmulatorstatsTags());
  }, [dispatch, search]);

  const handleChartSelect = handleSelectFactory(setSelectedChart);

  return (
    <MainLayout>
      <div className="container">
        <Header
          title={"HDS Emulator Stats Chart"}
          className={"display-6 mt-4 mb-4"}
        />
        <CustomBackButton
          routeTo="emustats"
          theme={theme}
          mb={"mb-4"}
          paramsObj={paramsToObject(search)}
        />
        <EmulatorstatsQuery view="chartview" />
        <SelectChart
          chartOptions={chartOptions}
          handleChartSelect={handleChartSelect}
          selectedChart={selectedChart}
        />

        {loading ? (
          <LoaderDiv>
            <Loader size={50} />
          </LoaderDiv>
        ) : (
          <>
            {selectedChart && selectedChart.value === "Time Series Chart" ? (
              <EmulatorstatsSeries />
            ) : (
              <EmulatorstatsChart />
            )}
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
