import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { NavTabItem, NavTabSpan, NavTabs } from "components/styled";
import EmustatSeries from "components/plotly/EmustatsSeries";
import { scenePickerAndCalc } from "features/emulatorstats/emulatorstatsSlice";
import { darkThemeClass, selectDarkStyles } from "utils/utils";

function EmulatorstatsSeries(props) {
  const [activetab, setActiveTab] = useState("pickRateVsReportTime");
  const [selectedDate, setSelectedDate] = useState(null);
  const { theme } = useSelector((state) => state.home);
  const {
    internal: {
      emuseries: {
        gripSuccessPercent,
        hoverInfo,
        pickSessionPercent,
        picksPerHour,
        thoroughnessPercent,
        timeSeries,
        dates,
      },
    },
  } = useSelector((state) => state.emulatorstats);
  const dispatch = useDispatch();
  const dateOptions = dates?.map((x) => {
    return { label: x, value: x };
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDateSelect = (newValue, actionMeta) => {
    setSelectedDate(newValue);
    dispatch(scenePickerAndCalc(newValue.value));
  };

  const dark = darkThemeClass("dark-theme", theme);
  const customStyles = dark ? selectDarkStyles : {};

  return (
    <>
      <NavTabs>
        <NavTabItem>
          <NavTabSpan
            onClick={() => handleTabChange("pickRateVsReportTime")}
            activetab={activetab}
            navto={"pickRateVsReportTime"}
            theme={theme}
          >
            Pick Rate Vs Scene
          </NavTabSpan>
        </NavTabItem>
        <NavTabItem>
          <NavTabSpan
            onClick={() => handleTabChange("thoroughnessVsReportTime")}
            activetab={activetab}
            navto={"thoroughnessVsReportTime"}
            theme={theme}
          >
            Thoroughness Vs Scene
          </NavTabSpan>
        </NavTabItem>
        <NavTabItem>
          <NavTabSpan
            onClick={() => handleTabChange("gripSuccessVsReportTime")}
            activetab={activetab}
            navto={"gripSuccessVsReportTime"}
            theme={theme}
          >
            Grip Success Vs Scene
          </NavTabSpan>
        </NavTabItem>
        <NavTabItem>
          <NavTabSpan
            onClick={() => handleTabChange("pickSuccessVsReportTime")}
            activetab={activetab}
            navto={"pickSuccessVsReportTime"}
            theme={theme}
          >
            Pick Success Vs Scene
          </NavTabSpan>
        </NavTabItem>
      </NavTabs>
      <Select
        isSearchable
        placeholder="dec"
        options={dateOptions}
        name="date"
        inputId="date"
        onChange={handleDateSelect}
        value={selectedDate}
        defaultValue={selectedDate}
        className="multi-select-container"
        classNamePrefix="select"
        styles={customStyles}
      />
      {activetab === "pickRateVsReportTime" && (
        <EmustatSeries
          ydata={picksPerHour}
          xdata={timeSeries}
          hovers={hoverInfo}
          theme={theme}
          title={`Pick Rate vs Report Time ${selectedDate?.value || ""}`}
          ylabel="picks_per_hour"
        />
      )}

      {activetab === "thoroughnessVsReportTime" && (
        <EmustatSeries
          ydata={thoroughnessPercent}
          xdata={timeSeries}
          hovers={hoverInfo}
          theme={theme}
          title={`Thoroughness vs Report Time ${selectedDate?.value || ""}`}
          ylabel="thoroughness_percentage"
        />
      )}

      {activetab === "gripSuccessVsReportTime" && (
        <EmustatSeries
          ydata={gripSuccessPercent}
          xdata={timeSeries}
          hovers={hoverInfo}
          theme={theme}
          title={`Grip Success vs Report Time ${selectedDate?.value || ""}`}
          ylabel="grip_success_percentage"
        />
      )}

      {activetab === "pickSuccessVsReportTime" && (
        <EmustatSeries
          ydata={pickSessionPercent}
          xdata={timeSeries}
          hovers={hoverInfo}
          theme={theme}
          title={`Pick Success vs Report Time ${selectedDate?.value || ""}`}
          ylabel="pick_success_percentage"
        />
      )}
    </>
  );
}

EmulatorstatsSeries.propTypes = {};

export default EmulatorstatsSeries;
