import { useState } from "react";
import { useSelector } from "react-redux";
import EmustatsPlot from "components/plotly/EmustatsPlot";
import { EmustatsTabular } from "./EmulatorstatsHelpers";
import { useLocation } from "react-router-dom";
import { paramsToObject } from "utils/utils";
import { NavTabItem, NavTabSpan, NavTabs } from "components/styled";

function EmulatorstatsChart(props) {
  const [activetab, setActiveTab] = useState("pickRateVsScene");
  const { theme } = useSelector((state) => state.home);
  const {
    internal: {
      emuplots: {
        gripSuccessPercent,
        pickSessionPercent,
        picksPerHour,
        thoroughnessPercent,
      },
    },
  } = useSelector((state) => state.emulatorstats);
  const { search } = useLocation();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <EmustatsTabular paramsObj={paramsToObject(search)} />
      <NavTabs>
        <NavTabItem>
          <NavTabSpan
            onClick={() => handleTabChange("pickRateVsScene")}
            activetab={activetab}
            navto={"pickRateVsScene"}
            theme={theme}
          >
            Pick Rate Vs Scene
          </NavTabSpan>
        </NavTabItem>
        <NavTabItem>
          <NavTabSpan
            onClick={() => handleTabChange("thoroughnessVsScence")}
            activetab={activetab}
            navto={"thoroughnessVsScence"}
            theme={theme}
          >
            Thoroughness Vs Scene
          </NavTabSpan>
        </NavTabItem>
        <NavTabItem>
          <NavTabSpan
            onClick={() => handleTabChange("gripSuccessVsScene")}
            activetab={activetab}
            navto={"gripSuccessVsScene"}
            theme={theme}
          >
            Grip Success Vs Scene
          </NavTabSpan>
        </NavTabItem>
        <NavTabItem>
          <NavTabSpan
            onClick={() => handleTabChange("pickSuccessVsScene")}
            activetab={activetab}
            navto={"pickSuccessVsScene"}
            theme={theme}
          >
            Pick Success Vs Scene
          </NavTabSpan>
        </NavTabItem>
      </NavTabs>
      {activetab === "pickRateVsScene" && (
        <EmustatsPlot
          traces={picksPerHour}
          theme={theme}
          title="Pick Rate vs Scene"
          ylabel="picks_per_hour"
        />
      )}
      {activetab === "thoroughnessVsScence" && (
        <EmustatsPlot
          traces={thoroughnessPercent}
          theme={theme}
          title="Thoroughness vs Scene"
          ylabel="thoroughness_percentage"
        />
      )}
      {activetab === "gripSuccessVsScene" && (
        <EmustatsPlot
          traces={gripSuccessPercent}
          theme={theme}
          title="Grip Success vs Scene"
          ylabel="grip_success_percentage"
        />
      )}
      {activetab === "pickSuccessVsScene" && (
        <EmustatsPlot
          traces={pickSessionPercent}
          theme={theme}
          title="Pick Success vs Scene"
          ylabel="pick_success_percentage"
        />
      )}
    </>
  );
}

EmulatorstatsChart.propTypes = {};

export default EmulatorstatsChart;
