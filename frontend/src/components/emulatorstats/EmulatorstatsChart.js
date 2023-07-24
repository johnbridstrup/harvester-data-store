import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import { toJSON } from "danfojs";
import EmustatsPlot from "components/plotly/EmustatsPlot";
import { EmustatsTabular, createDataFrame } from "./EmulatorstatsHelpers";
import { useLocation } from "react-router-dom";
import {
  groupByWeek,
  mapTraces,
  mergeSort,
  paramsToObject,
  sortByMonth,
} from "utils/utils";
import { NavTabItem, NavTabSpan, NavTabs } from "components/styled";

/**
 * Transforms emustats api data using danfo.js pandas'
 * like data structure and return the aggregates
 * This function needs to be in the component to avoid the test
 * module error experienced in all modules.
 * TypeError: _danfojs.DataFrame is not a constructor
 * @param {Array} emustats
 * @returns
 */
const transformEmustatsAggs = (emustats = []) => {
  let picksPerHour = [];
  let thoroughnessPercent = [];
  let gripSuccessPercent = [];
  let pickSessionPercent = [];

  const weekStr = (dateStr, weekStart = 3) => {
    let mom = moment(dateStr);
    let dayOfWeekMod = mom.day() + ((7 - weekStart) % 7);

    const grpDate = mom.subtract(dayOfWeekMod, "days");
    return grpDate.format("YYYY-MM-DD");
  };

  if (emustats.length > 0) {
    let df = createDataFrame(weekStr, emustats);

    const picks_col = df.column("num_picks").div(df.column("elapsed_hours"));
    df.addColumn("picks_per_hour", picks_col, { inplace: true });

    df = df.groupby(["reportTime", "date"]).agg({
      num_picks: "sum",
      num_grips: "sum",
      num_targets: "sum",
      elapsed_hours: "sum",
      num_pick_attempts: "sum",
      num_grip_attempts: "sum",
      pick_success_percentage: "std",
      grip_success_percentage: "std",
      thoroughness_percentage: "std",
      picks_per_hour: "std",
    });

    const picks_per_hour = df
      .column("num_picks_sum")
      .div(df.column("elapsed_hours_sum"));
    const thoroughness = df
      .column("num_picks_sum")
      .div(df.column("num_targets_sum"))
      .mul(100);
    const grip_success = df
      .column("num_picks_sum")
      .div(df.column("num_grip_attempts_sum"))
      .mul(100);
    const pick_success = df
      .column("num_picks_sum")
      .div(df.column("num_pick_attempts_sum"))
      .mul(100);

    df.addColumn("picks_per_hour", picks_per_hour, { inplace: true });
    df.addColumn("thoroughness", thoroughness, { inplace: true });
    df.addColumn("grip_success", grip_success, { inplace: true });
    df.addColumn("pick_success", pick_success, { inplace: true });

    const results = toJSON(df);
    sortByMonth(results);
    const resultObj = groupByWeek(results);
    picksPerHour = mergeSort(mapTraces("picks_per_hour", resultObj));
    thoroughnessPercent = mergeSort(mapTraces("thoroughness", resultObj));
    gripSuccessPercent = mergeSort(mapTraces("grip_success", resultObj));
    pickSessionPercent = mergeSort(mapTraces("pick_success", resultObj));
  }
  return {
    picksPerHour,
    thoroughnessPercent,
    gripSuccessPercent,
    pickSessionPercent,
  };
};

function EmulatorstatsChart(props) {
  const [activetab, setActiveTab] = useState("pickRateVsScene");
  const { emustats } = useSelector((state) => state.emulatorstats);
  const { theme } = useSelector((state) => state.home);
  const { search } = useLocation();
  const {
    gripSuccessPercent,
    pickSessionPercent,
    picksPerHour,
    thoroughnessPercent,
  } = useMemo(() => transformEmustatsAggs(emustats), [emustats]);

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
