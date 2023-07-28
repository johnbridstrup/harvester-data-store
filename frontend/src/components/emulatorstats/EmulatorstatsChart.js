import { useState } from "react";
import { useSelector } from "react-redux";
import WeeklyEmustatPlot from "components/plotly/WeeklyEmustatPlot";
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
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
            onClick={() => handleTabChange("thoroughnessVsScene")}
            activetab={activetab}
            navto={"thoroughnessVsScene"}
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
        <WeeklyEmustatPlot
          traces={picksPerHour}
          theme={theme}
          title="Pick Rate vs Scene"
          ylabel="picks_per_hour"
        />
      )}
      {activetab === "thoroughnessVsScene" && (
        <WeeklyEmustatPlot
          traces={thoroughnessPercent}
          theme={theme}
          title="Thoroughness vs Scene"
          ylabel="thoroughness_percentage"
        />
      )}
      {activetab === "gripSuccessVsScene" && (
        <WeeklyEmustatPlot
          traces={gripSuccessPercent}
          theme={theme}
          title="Grip Success vs Scene"
          ylabel="grip_success_percentage"
        />
      )}
      {activetab === "pickSuccessVsScene" && (
        <WeeklyEmustatPlot
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
